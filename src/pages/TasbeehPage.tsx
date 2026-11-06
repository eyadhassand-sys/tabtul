import { RotateCcw } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { dateKey, shiftDays } from '@/lib/dates';
import { TASBEEH_PHRASES, TASBEEH_TARGETS } from '@/data/tasbeeh';

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function TasbeehPage() {
  const { data, tapTasbeeh, resetTasbeeh, updateTasbeeh } = useAppData();
  const { tasbeeh, settings } = data;
  const phrase = TASBEEH_PHRASES.find((p) => p.id === tasbeeh.phraseId) ?? TASBEEH_PHRASES[0];
  const progress = Math.min(tasbeeh.count / tasbeeh.target, 1);
  const reached = tasbeeh.count >= tasbeeh.target;

  const today = dateKey();
  const todayTotal = tasbeeh.totals[today] ?? 0;
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = shiftDays(today, i - 6);
    const date = new Date(`${key}T00:00:00`);
    return { key, total: tasbeeh.totals[key] ?? 0, label: WEEKDAYS[date.getDay()] };
  });
  const weekMax = Math.max(1, ...week.map((d) => d.total));
  const weekTotal = week.reduce((sum, d) => sum + d.total, 0);
  const monthTotal = Object.entries(tasbeeh.totals)
    .filter(([key]) => key.slice(0, 7) === today.slice(0, 7))
    .reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="animate-fade-up grid gap-8 lg:grid-cols-[1fr_340px]">
      <section className="flex flex-col items-center">
        <header className="mb-6 w-full text-center lg:text-start">
          <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">المسبحة</h1>
          <p className="mt-2 text-muted">اختر الذكر وهدفك، ثم اضغط على الدائرة.</p>
        </header>

        <div className="flex flex-wrap justify-center gap-2">
          {TASBEEH_PHRASES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => updateTasbeeh({ phraseId: p.id })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                p.id === phrase.id ? 'bg-brand-800 text-white' : 'border border-line bg-card text-muted hover:text-ink'
              }`}
            >
              {p.text}
            </button>
          ))}
        </div>

        <div className="relative mt-10 flex h-72 w-72 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" className="stroke-line" strokeWidth="4" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-gold-500 transition-all duration-500"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
            />
          </svg>
          <button
            type="button"
            onClick={tapTasbeeh}
            aria-label={`سبّح: ${phrase.text}`}
            className="flex h-56 w-56 flex-col items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-xl transition active:scale-95 active:shadow-md"
          >
            <span className="font-display text-7xl font-bold tabular-nums">{tasbeeh.count}</span>
            <span className="mt-2 text-sm text-gold-100/90">من {tasbeeh.target}</span>
          </button>
        </div>

        <p className="mt-6 min-h-6 text-center text-sm font-medium text-gold-700 dark:text-gold-300">
          {reached ? 'بلغت هدفك اليوم، بارك الله فيك' : phrase.text}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={resetTasbeeh}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition hover:text-ink"
          >
            <RotateCcw className="h-4 w-4" />
            تصفير العداد
          </button>
          <div className="flex gap-1 rounded-full border border-line bg-card p-1">
            {TASBEEH_TARGETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateTasbeeh({ target: t })}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  tasbeeh.target === t ? 'bg-gold-100 text-brand-900' : 'text-muted hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {!settings.vibration && <p className="mt-4 text-xs text-muted">الاهتزاز متوقف من الإعدادات.</p>}
      </section>

      <aside className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="اليوم" value={todayTotal} />
          <StatBox label="هذا الشهر" value={monthTotal} />
        </div>
        <div className="rounded-3xl border border-line bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">آخر 7 أيام</h2>
            <p className="text-sm text-muted">المجموع: {weekTotal}</p>
          </div>
          <div className="flex h-40 items-end justify-between gap-2">
            {week.map((d) => (
              <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${d.key === today ? 'bg-gold-500' : 'bg-brand-500/70'}`}
                  style={{ height: `${Math.max(4, (d.total / weekMax) * 100)}%` }}
                  title={`${d.total}`}
                />
                <span className="text-[11px] text-muted">{d.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-line bg-card p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-brand-900 dark:text-gold-300">{value}</p>
    </div>
  );
}
