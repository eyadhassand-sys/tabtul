import { useState } from 'react';
import { CircleCheck, CloudOff, LoaderCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData, type SyncStatus } from '@/context/AppDataContext';

const SYNC_LABELS: Record<SyncStatus, { text: string; className: string }> = {
  idle: { text: '', className: '' },
  syncing: { text: 'جارٍ حفظ تقدّمك في السحابة...', className: 'text-muted' },
  synced: { text: 'تم حفظ تقدّمك في السحابة', className: 'text-brand-700 dark:text-gold-300' },
  error: { text: 'تعذّرت المزامنة مؤقتاً، وستُعاد المحاولة عند أول تغيير.', className: 'text-red-700 dark:text-red-300' },
};

export function AccountSection() {
  const { user, signOut } = useAuth();
  const { syncStatus } = useAppData();
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setError(null);
    setSigningOut(true);
    const result = await signOut();
    if (result) {
      setError(result);
      setSigningOut(false);
    }
  };

  const sync = SYNC_LABELS[syncStatus];

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
      <h2 className="font-display text-xl font-bold">الحساب والمزامنة</h2>
      <div className="mt-4 space-y-4">
        <div className="flex flex-col gap-1 rounded-2xl bg-paper px-4 py-3">
          <span className="text-sm text-muted">البريد المسجّل</span>
          <span dir="ltr" className="break-all text-start text-sm font-medium text-ink">
            {user?.email}
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 text-sm">
          {syncStatus === 'syncing' && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-muted" />}
          {syncStatus === 'synced' && <CircleCheck className="h-4 w-4 shrink-0 text-brand-700 dark:text-gold-300" />}
          {syncStatus === 'error' && <CloudOff className="h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />}
          <span className={sync.className}>{sync.text || 'بياناتك تُحفظ تلقائياً عند كل تغيير.'}</span>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          عند تسجيل الخروج تُمسح بيانات هذا الجهاز، وتبقى محفوظة في حسابك لتعود عند الدخول مرة أخرى.
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-paper disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
        </button>
      </div>
    </section>
  );
}
