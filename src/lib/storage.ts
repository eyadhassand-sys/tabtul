import type { AppData, Settings } from '@/lib/types';
import { ALL_REMINDER_TYPE_IDS } from '@/data/reminders';

const STORAGE_KEY = 'dhikr-companion-v1';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  fontSize: 'md',
  sound: true,
  vibration: true,
  prayerTimes: null,
  reminders: {
    enabled: false,
    intervalMinutes: 30,
    enabledTypes: [...ALL_REMINDER_TYPE_IDS],
    quietStart: '22:00',
    quietEnd: '06:00',
  },
};

export const DEFAULT_APP_DATA: AppData = {
  settings: DEFAULT_SETTINGS,
  dhikrCounts: {},
  tasbeeh: {
    count: 0,
    target: 100,
    phraseId: 'subhanallah',
    totals: {},
  },
  lastReminderAt: null,
  lastReminderTypeId: null,
};

export function normalizeAppData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return DEFAULT_APP_DATA;
  const parsed = raw as Partial<AppData>;
  return {
    ...DEFAULT_APP_DATA,
    ...parsed,
    settings: {
      ...DEFAULT_SETTINGS,
      ...parsed.settings,
      reminders: { ...DEFAULT_SETTINGS.reminders, ...parsed.settings?.reminders },
    },
    tasbeeh: { ...DEFAULT_APP_DATA.tasbeeh, ...parsed.tasbeeh },
  };
}

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeAppData(JSON.parse(raw)) : DEFAULT_APP_DATA;
  } catch {
    return DEFAULT_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be full or disabled; the app keeps working in memory.
  }
}
