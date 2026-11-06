import { useAppData } from '@/context/AppDataContext';
import { dateKey, formatGregorian } from '@/lib/dates';
import { countCompleted, DAILY_CATEGORY_IDS, itemsForCategories } from '@/lib/progress';

const WEEK_HEADERS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

export function ProgressPage() {
  const { data, getDhikrCount } = useAppData();
  const dailyItems = itemsForCategories(DAILY_CATEGORY_IDS);
  const today = new Date();
  const todayKey = dateKey(today);

  const dailyDone = (key: string) =>
    countCompleted(dailyItems, (id) => data.dhikrCounts[key]?.[id] ?? 0) / Math.max(dailyItems.length, 1);

  const dayTotal = (key: string) => Object.values(data.dhikrCounts[key] ?? {}).reduce((a, b) => a + b, 0);

  const daysWithActivity = Object.keys(data.dhikrCounts).filter((k) => dayTotal(k) > 0).length;
  const fullDays = Object.keys(data.dhikrCounts).filter((k) => dailyDone(k) >= 1).length;
  const tasbeehAll = Object.values(data.tasbeeh.totals).reduce((a, b) => a + b, 0);
  const monthPrefix = todayKey.slice(0, 7);
  const tasbeehMonth = Object.entries(data.tasbeeh.totals)
    .filter(([k]) => k.startsWith(monthPrefix))
    .reduce((a, [, v]) => a + v, 0);
  const dhikrWeek = Array.from({ length: 7 }, (_, i) => dayTotal(dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)))).reduce(
    (a, b) => a + b,
    0,
  );

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">الإحصائيات</h1>
        <p className="mt-2 text-muted">تقدمك في الذكر والمداومة، بلا ضغط ولا لوم.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="أذكار اليوم" value={dayTotal(todayKey)} />
        <Stat label="أيام الذكر" value={daysWithActivity} />
        <Stat label="أيام أكملت أذكارك" value={fullDays} />
        <Stat label="تسبيحات هذا الشهر" value={tasbeehMonth} />
        <Stat label="أذكار آخر 7 أيام" value={dhikrWeek} />
        <Stat label="إجمالي التسبيح" value={tasbeehAll} />
        <Stat label="أذكار اليوم لم تكتمل" value={dailyItems.length - countCompleted(dailyItems, (id) => getDhikrCount(id))} />
      </section>

      <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">{formatGregorian(today)}</h2>
        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs text-muted">
          {WEEK_HEADERS.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            if (day === null) return <span key={`empty-${idx}`} />;
            const key = dateKey(new Date(year, month, day));
            const ratio = dailyDone(key);
            const total = dayTotal(key);
            const isToday = key === todayKey;
            const tone =
              ratio >= 1
                ? 'bg-brand-700 text-white'
                : ratio > 0
                  ? 'bg-brand-100 text-brand-900 dark:bg-brand-800/60 dark:text-gold-100'
                  : total > 0
                    ? 'bg-gold-100 text-brand-900'
                    : 'bg-paper text-muted';
            return (
              <div
                key={key}
                title={`${total} ذكر`}
                className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition ${tone} ${
                  isToday ? 'ring-2 ring-gold-500 ring-offset-2 ring-offset-card' : ''
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
          <Legend className="bg-brand-700" label="أكملت أذكار الصباح والمساء" />
          <Legend className="bg-brand-100" label="أكملت جزءًا منها" />
          <Legend className="bg-gold-100" label="ذكر بدون إكمال" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-line bg-card p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-brand-900 dark:text-gold-300">{value}</p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
