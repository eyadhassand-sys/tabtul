import { useEffect, useState } from 'react';
import { ArrowLeft, Circle } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { dateKey, formatCountdown, formatGregorian, formatHijri, greetingFor, nextPrayer, PRAYER_LABELS } from '@/lib/dates';
import { countCompleted, DAILY_CATEGORY_IDS, itemsForCategories } from '@/lib/progress';
import { FAITH_MESSAGES } from '@/data/reminders';
import type { PageId } from '@/components/AppShell';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data, getDhikrCount } = useAppData();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const dailyItems = itemsForCategories(DAILY_CATEGORY_IDS);
  const done = countCompleted(dailyItems, (id) => getDhikrCount(id));
  const percent = dailyItems.length ? Math.round((done / dailyItems.length) * 100) : 0;
  const pending = dailyItems.filter((item) => getDhikrCount(item.id) < item.repeat);
  const todayTotal = Object.values(data.dhikrCounts[dateKey(now)] ?? {}).reduce((a, b) => a + b, 0);
  const faith = FAITH_MESSAGES[Math.floor(now.getTime() / 86_400_000) % FAITH_MESSAGES.length];
  const prayer = data.settings.prayerTimes ? nextPrayer(data.settings.prayerTimes, now) : null;

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <p className="text-sm text-muted">{formatGregorian(now)}</p>
        <p className="text-sm text-muted">{formatHijri(now)}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-brand-900 dark:text-gold-300">{greetingFor(now)}</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-brand-800 p-6 text-white shadow-lg">
          <p className="text-sm text-gold-100/80">الصلاة القادمة</p>
          {prayer ? (
            <>
              <p className="mt-2 font-display text-3xl font-bold">{PRAYER_LABELS[prayer.name]}</p>
              <p className="mt-2 text-gold-100">متبقي {formatCountdown(prayer.remainingMs)}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg">لم تُحدَّد مواقيت الصلاة بعد</p>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-300 px-4 py-2 text-sm font-medium text-brand-900 transition hover:bg-gold-100"
              >
                أضف المواقيت
                <ArrowLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">إنجاز أذكار اليوم</p>
            <p className="font-display text-3xl font-bold text-brand-700 dark:text-gold-300">{percent}%</p>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-gradient-to-l from-gold-500 to-brand-500 transition-all duration-700" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-4 text-sm text-muted">
            قرأت <span className="font-bold text-ink">{todayTotal}</span> تكرارًا اليوم
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-card p-6 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">أذكار لم تكتمل</h2>
            <button type="button" onClick={() => onNavigate('adhkar')} className="text-sm font-medium text-brand-700 transition hover:text-brand-900 dark:text-gold-300">
              فتح الأذكار
            </button>
          </div>
          {pending.length === 0 ? (
            <p className="rounded-2xl bg-brand-50 p-4 text-brand-900 dark:bg-brand-900/40 dark:text-gold-100">
              أتممت أذكار الصباح والمساء اليوم، بارك الله فيك.
            </p>
          ) : (
            <ul className="space-y-2">
              {pending.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3">
                  <span className="line-clamp-1 text-sm leading-relaxed">{item.text}</span>
                  <span className="shrink-0 text-xs font-medium text-muted">
                    {getDhikrCount(item.id)}/{item.repeat}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col justify-between gap-6">
          <button
            type="button"
            onClick={() => onNavigate('tasbeeh')}
            className="group flex items-center justify-between rounded-3xl bg-gold-100 p-6 text-brand-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-start">
              <p className="font-display text-xl font-bold">المسبحة</p>
              <p className="text-sm text-brand-800">سبّح الآن</p>
            </div>
            <Circle className="h-10 w-10 text-gold-700 transition group-hover:rotate-12" />
          </button>
          <div className="rounded-3xl border border-line bg-card p-6 shadow-sm">
            <p className="font-display text-lg leading-loose text-brand-900 dark:text-gold-100">{faith.text}</p>
            <p className="mt-2 text-xs text-muted">{faith.source}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
