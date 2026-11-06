import { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Volume2 } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { ADHKAR_CATEGORIES } from '@/data/adhkar';
import type { AdhkarCategory, Dhikr } from '@/lib/types';

export function AdhkarPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = ADHKAR_CATEGORIES.find((c) => c.id === selectedId) ?? null;

  if (selected) {
    return <CategoryView category={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">الأذكار</h1>
        <p className="mt-2 text-muted">اختر قسمًا لتبدأ الذكر، وتُحفظ تكراراتك تلقائيًا لهذا اليوم.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {ADHKAR_CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} onOpen={() => setSelectedId(category.id)} />
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted">
        المصادر مذكورة بجانب كل ذكر. يُنصح بمراجعة كتب الحديث والأذكار المعتمدة للتحقق من الألفاظ.
      </p>
    </div>
  );
}

function CategoryCard({ category, onOpen }: { category: AdhkarCategory; onOpen: () => void }) {
  const { getDhikrCount } = useAppData();
  const done = category.items.filter((item) => getDhikrCount(item.id) >= item.repeat).length;
  const percent = Math.round((done / category.items.length) * 100);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center gap-4 rounded-3xl border border-line bg-card p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-bold">{category.title}</p>
        <p className="mt-1 text-sm text-muted">{category.subtitle}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <ChevronLeft className="h-5 w-5 shrink-0 text-muted transition group-hover:-translate-x-1 group-hover:text-brand-700" />
    </button>
  );
}

function CategoryView({ category, onBack }: { category: AdhkarCategory; onBack: () => void }) {
  return (
    <div className="animate-fade-up space-y-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition hover:text-brand-900 dark:text-gold-300">
        <ArrowRight className="h-4 w-4" />
        كل الأقسام
      </button>
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-gold-300">{category.title}</h1>
        <p className="mt-2 text-muted">{category.subtitle}</p>
      </header>
      <div className="space-y-4">
        {category.items.map((item) => (
          <DhikrCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function DhikrCard({ item }: { item: Dhikr }) {
  const { getDhikrCount, countDhikr } = useAppData();
  const count = getDhikrCount(item.id);
  const complete = count >= item.repeat;

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <article className={`rounded-3xl border p-6 shadow-sm transition ${complete ? 'border-brand-500/50 bg-brand-50/60 dark:bg-brand-900/30' : 'border-line bg-card'}`}>
      <p className="font-display text-xl leading-loose text-ink">{item.text}</p>
      <p className="mt-3 text-xs text-muted">المصدر: {item.source}</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={speak}
          aria-label="استماع للذكر"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-brand-700 transition hover:bg-brand-50 dark:text-gold-300 dark:hover:bg-brand-900/40"
        >
          <Volume2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => countDhikr(item.id, item.repeat)}
          disabled={complete}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-95 ${
            complete ? 'bg-brand-100 text-brand-900 dark:bg-brand-800 dark:text-white' : 'bg-brand-800 text-white hover:bg-brand-900'
          }`}
        >
          {complete ? <Check className="h-4 w-4" /> : null}
          {complete ? 'تم' : `${count} / ${item.repeat}`}
        </button>
      </div>
    </article>
  );
}
