import { useState, type FormEvent } from 'react';
import { LogIn, Lock, Mail, MoonStar, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signin' | 'signup';

const COPY: Record<Mode, { title: string; subtitle: string; submit: string; switchText: string; switchAction: string }> = {
  signin: {
    title: 'مرحباً بعودتك',
    subtitle: 'سجّل دخولك لتجد تسبيحك وتقدّمك اليومي على كل أجهزتك.',
    submit: 'تسجيل الدخول',
    switchText: 'ليس لديك حساب؟',
    switchAction: 'إنشاء حساب جديد',
  },
  signup: {
    title: 'أنشئ حسابك',
    subtitle: 'يحفظ الحساب تسبيحك وتقدّمك اليومي ليبقى معك على كل جهاز.',
    submit: 'إنشاء الحساب',
    switchText: 'لديك حساب بالفعل؟',
    switchAction: 'تسجيل الدخول',
  },
};

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const copy = COPY[mode];

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const trimmedEmail = email.trim();
    const result = mode === 'signin' ? await signIn(trimmedEmail, password) : await signUp(trimmedEmail, password);
    setSubmitting(false);
    if (result) setError(result);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="animate-fade-up w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-800 text-gold-300 shadow-lg">
            <MoonStar className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-brand-900 dark:text-gold-300">ذكّرني بالله</h1>
        </div>

        <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-bold text-ink">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{copy.subtitle}</p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-muted">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </span>
              <input
                type="email"
                dir="ltr"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-left text-ink transition focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-muted">
                <Lock className="h-4 w-4" />
                كلمة المرور
              </span>
              <input
                type="password"
                dir="ltr"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-left text-ink transition focus:border-brand-500 focus:outline-none"
              />
              {mode === 'signup' && <span className="mt-2 block text-xs text-muted">6 أحرف على الأقل.</span>}
            </label>

            {error && (
              <p role="alert" className="animate-fade-up rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {submitting ? 'جارٍ المعالجة...' : copy.submit}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {copy.switchText}{' '}
          <button type="button" onClick={switchMode} className="font-medium text-brand-800 underline-offset-4 hover:underline dark:text-gold-300">
            {copy.switchAction}
          </button>
        </p>
      </div>
    </div>
  );
}
