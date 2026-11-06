import type { ReactNode } from 'react';
import { BarChart3, Bell, BookOpen, CircleDot, Home, Lightbulb, Settings, X } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { REMINDER_TYPES } from '@/data/reminders';

export type PageId = 'home' | 'adhkar' | 'tasbeeh' | 'reflect' | 'reminders' | 'progress' | 'settings';

const NAV_ITEMS: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'adhkar', label: 'الأذكار', icon: BookOpen },
  { id: 'tasbeeh', label: 'المسبحة', icon: CircleDot },
  { id: 'reflect', label: 'تفكّر', icon: Lightbulb },
  { id: 'reminders', label: 'التذكيرات', icon: Bell },
  { id: 'progress', label: 'الإحصائيات', icon: BarChart3 },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

interface AppShellProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
}

export function AppShell({ page, onNavigate, children }: AppShellProps) {
  const { notice, dismissNotice } = useAppData();
  const noticeType = notice ? REMINDER_TYPES.find((t) => t.id === notice.typeId)?.label : null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-line bg-card/60 p-6 md:flex">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-800 text-gold-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-brand-900 dark:text-gold-300">ذكّرني بالله</p>
              <p className="text-xs text-muted">رفيقك اليومي</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg justify-between">
          {NAV_ITEMS.map((item) => (
            <MobileNavButton key={item.id} item={item} active={page === item.id} onClick={() => onNavigate(item.id)} />
          ))}
        </div>
      </nav>

      {notice && (
        <div
          role="status"
          className="animate-fade-up fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl border border-gold-300 bg-card p-4 shadow-xl md:bottom-6 md:start-auto md:end-6"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              {noticeType && <p className="text-xs font-medium text-gold-700">{noticeType}</p>}
              <p className="mt-1 leading-relaxed text-ink">{notice.text}</p>
            </div>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="إغلاق التذكير"
              className="rounded-full p-1 text-muted transition hover:bg-line hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: (typeof NAV_ITEMS)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-start font-medium transition ${
        active ? 'bg-brand-800 text-white shadow-sm' : 'text-muted hover:bg-line/60 hover:text-ink'
      }`}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </button>
  );
}

function MobileNavButton({ item, active, onClick }: { item: (typeof NAV_ITEMS)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
        active ? 'text-brand-700 dark:text-gold-300' : 'text-muted'
      }`}
    >
      <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${active ? 'bg-brand-100/70 dark:bg-brand-800/60' : ''}`}>
        <Icon className="h-5 w-5" />
      </span>
      {item.label}
    </button>
  );
}
