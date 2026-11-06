import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadAppData, saveAppData, DEFAULT_APP_DATA } from '@/lib/storage';
import { dateKey, isInQuietHours } from '@/lib/dates';
import { REMINDER_TYPES } from '@/data/reminders';
import { useAuth } from '@/context/AuthContext';
import { fetchCloudData, mergeAppData, pushCloudData } from '@/lib/cloudSync';
import type { AppData, ReminderSettings, ReminderTypeId, Settings, TasbeehState } from '@/lib/types';

export interface ReminderNotice {
  id: number;
  text: string;
  typeId: ReminderTypeId;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface AppDataContextValue {
  data: AppData;
  syncStatus: SyncStatus;
  syncError: string | null;
  getDhikrCount: (id: string, date?: string) => number;
  countDhikr: (id: string, repeat: number) => void;
  tapTasbeeh: () => void;
  resetTasbeeh: () => void;
  updateTasbeeh: (patch: Partial<Omit<TasbeehState, 'totals'>>) => void;
  updateSettings: (patch: Partial<Omit<Settings, 'reminders'>>) => void;
  updateReminders: (patch: Partial<ReminderSettings>) => void;
  notice: ReminderNotice | null;
  dismissNotice: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const REMINDER_TICK_MS = 15_000;
const SAVE_DEBOUNCE_MS = 1000;

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio may be blocked until the user interacts with the page.
  }
}

function pickReminder(enabledTypes: ReminderTypeId[], avoid: ReminderTypeId | null) {
  const pool = REMINDER_TYPES.filter((t) => enabledTypes.includes(t.id));
  if (pool.length === 0) return null;
  const candidates = pool.length > 1 ? pool.filter((t) => t.id !== avoid) : pool;
  const type = candidates[Math.floor(Math.random() * candidates.length)];
  const text = type.messages[Math.floor(Math.random() * type.messages.length)];
  return { typeId: type.id, text };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [data, setData] = useState<AppData>(loadAppData);
  const [notice, setNotice] = useState<ReminderNotice | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const lastSynced = useRef<string | null>(null);
  const wasSignedIn = useRef(false);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', data.settings.theme === 'dark');
    root.style.fontSize = { sm: '14px', md: '16px', lg: '18px' }[data.settings.fontSize];
  }, [data.settings.theme, data.settings.fontSize]);

  useEffect(() => {
    if (!userId) {
      setReadyUserId(null);
      setSyncStatus('idle');
      setSyncError(null);
      if (wasSignedIn.current) {
        wasSignedIn.current = false;
        lastSynced.current = null;
        setData(DEFAULT_APP_DATA);
      }
      return;
    }

    wasSignedIn.current = true;
    let cancelled = false;
    setSyncStatus('syncing');
    setSyncError(null);

    (async () => {
      const { data: remote, error } = await fetchCloudData(userId);
      if (cancelled) return;
      if (error) {
        setSyncStatus('error');
        setSyncError(error);
        return;
      }
      const merged = remote ? mergeAppData(dataRef.current, remote) : dataRef.current;
      lastSynced.current = JSON.stringify(merged);
      setData(merged);
      const pushError = await pushCloudData(userId, merged);
      if (cancelled) return;
      setReadyUserId(userId);
      setSyncStatus(pushError ? 'error' : 'synced');
      setSyncError(pushError);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || readyUserId !== userId) return;
    const json = JSON.stringify(data);
    if (json === lastSynced.current) return;
    setSyncStatus('syncing');
    const timer = window.setTimeout(() => {
      (async () => {
        const pushError = await pushCloudData(userId, data);
        if (pushError) {
          setSyncStatus('error');
          setSyncError(pushError);
          return;
        }
        lastSynced.current = json;
        setSyncStatus('synced');
        setSyncError(null);
      })();
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [data, userId, readyUserId]);

  useEffect(() => {
    const tick = () => {
      const current = dataRef.current;
      const r = current.settings.reminders;
      if (!r.enabled) return;
      const now = new Date();
      const last = current.lastReminderAt ?? 0;
      if (now.getTime() - last < r.intervalMinutes * 60_000) return;
      if (isInQuietHours(now, r.quietStart, r.quietEnd)) return;
      const picked = pickReminder(r.enabledTypes, current.lastReminderTypeId);
      if (!picked) return;

      setData((prev) => ({ ...prev, lastReminderAt: now.getTime(), lastReminderTypeId: picked.typeId }));
      setNotice({ id: now.getTime(), text: picked.text, typeId: picked.typeId });
      if (current.settings.sound) playChime();
      if (current.settings.vibration && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('ذكّرني بالله', { body: picked.text, lang: 'ar' });
      }
    };
    const id = window.setInterval(tick, REMINDER_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const getDhikrCount = useCallback(
    (id: string, date: string = dateKey()) => data.dhikrCounts[date]?.[id] ?? 0,
    [data.dhikrCounts],
  );

  const countDhikr = useCallback((id: string, repeat: number) => {
    const today = dateKey();
    setData((prev) => {
      const current = prev.dhikrCounts[today]?.[id] ?? 0;
      if (current >= repeat) return prev;
      return {
        ...prev,
        dhikrCounts: {
          ...prev.dhikrCounts,
          [today]: { ...prev.dhikrCounts[today], [id]: current + 1 },
        },
      };
    });
  }, []);

  const tapTasbeeh = useCallback(() => {
    const today = dateKey();
    setData((prev) => {
      const t = prev.tasbeeh;
      return {
        ...prev,
        tasbeeh: {
          ...t,
          count: t.count + 1,
          totals: { ...t.totals, [today]: (t.totals[today] ?? 0) + 1 },
        },
      };
    });
    const { settings } = dataRef.current;
    if (settings.vibration && 'vibrate' in navigator) navigator.vibrate(15);
  }, []);

  const resetTasbeeh = useCallback(() => {
    setData((prev) => ({ ...prev, tasbeeh: { ...prev.tasbeeh, count: 0 } }));
  }, []);

  const updateTasbeeh = useCallback((patch: Partial<Omit<TasbeehState, 'totals'>>) => {
    setData((prev) => ({ ...prev, tasbeeh: { ...prev.tasbeeh, ...patch } }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Omit<Settings, 'reminders'>>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const updateReminders = useCallback((patch: Partial<ReminderSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, reminders: { ...prev.settings.reminders, ...patch } },
    }));
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      syncStatus,
      syncError,
      getDhikrCount,
      countDhikr,
      tapTasbeeh,
      resetTasbeeh,
      updateTasbeeh,
      updateSettings,
      updateReminders,
      notice,
      dismissNotice,
    }),
    [
      data,
      syncStatus,
      syncError,
      getDhikrCount,
      countDhikr,
      tapTasbeeh,
      resetTasbeeh,
      updateTasbeeh,
      updateSettings,
      updateReminders,
      notice,
      dismissNotice,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
