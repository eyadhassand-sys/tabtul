import { useMemo, useState } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { REFLECTIONS, REFLECTION_CATEGORIES } from '@/data/reflections';
import { dateKey } from '@/lib/dates';

export function ReflectPage() {
  const [category, setCategory] = useState<string>('الكل');
  const [offset, setOffset] = useState(0);

  const pool = useMemo(
    () => REFLECTIONS.filter((r) => category === 'الكل' || r.category === category),
    [category],
  );
  const dayIndex = useMemo(() => {
    const seed = dateKey().split('-').join('');
    return Number(seed) % Math.max(pool.length, 1);
  }, [pool.length]);
  const reflection = pool.length ? pool[(dayIndex + offset) % pool.length] : null;

  const changeCategory = (next: string) => {
    setCategory(next);
    setOffset(0);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">تفكّر</h1>
        <p className="mt-2 text-muted">توقف لحظة، وفكّر في حياتك وعلاقتك بالله.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['الكل', ...REFLECTION_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => changeCategory(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              category === c ? 'bg-brand-800 text-white' : 'border border-line bg-card text-muted hover:text-ink'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {reflection && (
        <article key={reflection.id} className="animate-fade-up mx-auto max-w-2xl rounded-3xl border border-line bg-card p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-2 text-sm font-medium text-gold-700 dark:text-gold-300">
            <Lightbulb className="h-4 w-4" />
            {reflection.category}
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold leading-snug text-brand-900 dark:text-gold-100">{reflection.title}</h2>
          <p className="mt-4 leading-loose text-ink">{reflection.idea}</p>

          <blockquote className="mt-6 rounded-2xl bg-brand-50 p-5 dark:bg-brand-900/40">
            <p className="font-display text-xl leading-loose text-brand-900 dark:text-gold-100">{reflection.quote}</p>
            <p className="mt-2 text-xs text-muted">{reflection.source}</p>
          </blockquote>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted">سؤال للتفكر</p>
              <p className="mt-1 leading-loose">{reflection.question}</p>
            </div>
            <div className="rounded-2xl border border-gold-300 bg-gold-100/60 p-4 dark:bg-gold-700/20">
              <p className="text-sm font-medium text-gold-700 dark:text-gold-300">عمل اليوم</p>
              <p className="mt-1 leading-loose">{reflection.deed}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            disabled={pool.length < 2}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-40 dark:text-gold-300 dark:hover:bg-brand-900/40"
          >
            <RefreshCw className="h-4 w-4" />
            تفكّر في موضوع آخر
          </button>
        </article>
      )}
    </div>
  );
}
