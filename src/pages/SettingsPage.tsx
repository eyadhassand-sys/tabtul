import { useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { AccountSection } from '@/components/AccountSection';
import { QrInstallCard } from '@/components/QrInstallCard';
import { PRAYER_LABELS, PRAYER_ORDER } from '@/lib/dates';
import type { PrayerTimes, Settings } from '@/lib/types';

const FONT_OPTIONS: { id: Settings['fontSize']; label: string }[] = [
  { id: 'sm', label: 'صغير' },
  { id: 'md', label: 'متوسط' },
  { id: 'lg', label: 'كبير' },
];

const EMPTY_TIMES: PrayerTimes = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' };

export function SettingsPage() {
  const { data, updateSettings } = useAppData();
  const { settings } = data;
  const [draft, setDraft] = useState<PrayerTimes>(settings.prayerTimes ?? EMPTY_TIMES);
  const [saved, setSaved] = useState(false);

  const draftComplete = PRAYER_ORDER.every((p) => /^\d{2}:\d{2}$/.test(draft[p]));

  const savePrayerTimes = () => {
    if (!draftComplete) return;
    updateSettings({ prayerTimes: draft });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">الإعدادات</h1>
        <p className="mt-2 text-muted">خصص التطبيق بما يناسبك.</p>
      </header>

      <AccountSection />

      <QrInstallCard />

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">المظهر</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-muted">الوضع</p>
            <div className="flex gap-2">
              <ToggleChip active={settings.theme === 'light'} onClick={() => updateSettings({ theme: 'light' })}>
                <Sun className="h-4 w-4" />
                نهاري
              </ToggleChip>
              <ToggleChip active={settings.theme === 'dark'} onClick={() => updateSettings({ theme: 'dark' })}>
                <Moon className="h-4 w-4" />
                ليلي
              </ToggleChip>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted">حجم الخط</p>
            <div className="flex gap-2">
              {FONT_OPTIONS.map((o) => (
                <ToggleChip key={o.id} active={settings.fontSize === o.id} onClick={() => updateSettings({ fontSize: o.id })}>
                  {o.label}
                </ToggleChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">الصوت والاهتزاز</h2>
        <div className="mt-4 space-y-3">
          <SwitchRow label="صوت التذكيرات" checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} />
          <SwitchRow label="اهتزاز عند كل ضغطة وتذكير" checked={settings.vibration} onChange={(v) => updateSettings({ vibration: v })} />
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">مواقيت الصلاة</h2>
        <p className="mt-1 text-sm text-muted">أدخل مواقيت صلاة يومك، وسيعرض التطبيق الصلاة القادمة وما تبقى لها.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
          {PRAYER_ORDER.map((p) => (
            <label key={p} className="flex flex-col gap-2 text-sm text-muted">
              {PRAYER_LABELS[p]}
              <input
                type="time"
                value={draft[p]}
                onChange={(e) => setDraft((d) => ({ ...d, [p]: e.target.value }))}
                className="rounded-xl border border-line bg-paper px-3 py-2 text-ink focus:border-brand-500 focus:outline-none"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={savePrayerTimes}
            disabled={!draftComplete}
            className="rounded-full bg-brand-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900 disabled:opacity-40"
          >
            حفظ المواقيت
          </button>
          {saved && <span className="animate-fade-up text-sm text-brand-700 dark:text-gold-300">تم الحفظ</span>}
        </div>
      </section>
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-brand-800 text-white' : 'border border-line text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-paper px-4 py-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-brand-700' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'end-0.5' : 'start-0.5'}`} />
      </button>
    </div>
  );
}
