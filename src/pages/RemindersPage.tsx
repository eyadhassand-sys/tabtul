import { Bell, BellOff, Moon } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { REMINDER_INTERVAL_OPTIONS, REMINDER_TYPES } from '@/data/reminders';
import type { ReminderTypeId } from '@/lib/types';

function intervalLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  if (minutes === 60) return 'ساعة';
  if (minutes === 120) return 'ساعتان';
  return `${minutes / 60} ساعات`;
}

export function RemindersPage() {
  const { data, updateReminders } = useAppData();
  const r = data.settings.reminders;
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  const toggleType = (id: ReminderTypeId) => {
    const next = r.enabledTypes.includes(id) ? r.enabledTypes.filter((t) => t !== id) : [...r.enabledTypes, id];
    updateReminders({ enabledTypes: next });
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    await Notification.requestPermission();
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">التذكيرات</h1>
        <p className="mt-2 text-muted">اضبط وقت التذكير وأنواعه، وسيصلك تذكير جديد بعد المدة التي تختارها.</p>
      </header>

      <section className="flex items-center justify-between gap-4 rounded-3xl bg-brand-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            {r.enabled ? <Bell className="h-6 w-6 text-gold-300" /> : <BellOff className="h-6 w-6 text-gold-100/70" />}
          </div>
          <div>
            <p className="font-display text-xl font-bold">{r.enabled ? 'التذكيرات تعمل' : 'التذكيرات متوقفة'}</p>
            <p className="text-sm text-gold-100/80">تظهر التذكيرات أثناء فتح التطبيق</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={r.enabled}
          onClick={() => updateReminders({ enabled: !r.enabled })}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${r.enabled ? 'bg-gold-500' : 'bg-white/20'}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${r.enabled ? 'end-1' : 'start-1'}`}
          />
          <span className="sr-only">تشغيل التذكيرات</span>
        </button>
      </section>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">كل كم دقيقة يصلني تذكير؟</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {REMINDER_INTERVAL_OPTIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => updateReminders({ intervalMinutes: minutes })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                r.intervalMinutes === minutes ? 'bg-brand-800 text-white' : 'border border-line text-muted hover:text-ink'
              }`}
            >
              {intervalLabel(minutes)}
            </button>
          ))}
        </div>
        <label className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
          مدة مخصصة بالدقائق
          <input
            type="number"
            min={5}
            max={720}
            value={r.intervalMinutes}
            onChange={(e) => {
              const v = Math.min(720, Math.max(5, Number(e.target.value) || 5));
              updateReminders({ intervalMinutes: v });
            }}
            className="w-24 rounded-xl border border-line bg-paper px-3 py-2 text-ink focus:border-brand-500 focus:outline-none"
          />
        </label>
      </section>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-brand-700 dark:text-gold-300" />
          <h2 className="font-display text-xl font-bold">أوقات الهدوء</h2>
        </div>
        <p className="mt-1 text-sm text-muted">لن تصلك تذكيرات خلال هذه الفترة.</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm text-muted">
            من
            <input
              type="time"
              value={r.quietStart}
              onChange={(e) => updateReminders({ quietStart: e.target.value })}
              className="rounded-xl border border-line bg-paper px-3 py-2 text-ink focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            إلى
            <input
              type="time"
              value={r.quietEnd}
              onChange={(e) => updateReminders({ quietEnd: e.target.value })}
              className="rounded-xl border border-line bg-paper px-3 py-2 text-ink focus:border-brand-500 focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">أنواع التذكيرات</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {REMINDER_TYPES.map((t) => {
            const on = r.enabledTypes.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleType(t.id)}
                aria-pressed={on}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-start text-sm transition ${
                  on ? 'border-brand-500/50 bg-brand-50 text-brand-900 dark:bg-brand-900/40 dark:text-gold-100' : 'border-line text-muted'
                }`}
              >
                {t.label}
                <span className={`h-3 w-3 shrink-0 rounded-full ${on ? 'bg-brand-500' : 'bg-line'}`} />
              </button>
            );
          })}
        </div>
      </section>

      {permission !== 'granted' && permission !== 'unsupported' && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold-300 bg-gold-100/60 p-6 dark:bg-gold-700/20">
          <p className="text-sm leading-relaxed">فعّل إشعارات المتصفح لتصلك التذكيرات حتى عندما تكون في تطبيق آخر.</p>
          <button
            type="button"
            onClick={requestPermission}
            className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            تفعيل الإشعارات
          </button>
        </section>
      )}
    </div>
  );
}
