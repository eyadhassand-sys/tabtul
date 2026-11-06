import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) return 'هذا البريد مسجّل بالفعل، جرّب تسجيل الدخول.';
  if (m.includes('invalid login credentials')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (m.includes('email not confirmed')) return 'البريد الإلكتروني غير مؤكد بعد.';
  if (m.includes('password should be at least')) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
  if (m.includes('invalid email')) return 'صيغة البريد الإلكتروني غير صحيحة.';
  if (m.includes('rate limit') || m.includes('too many')) return 'محاولات كثيرة، يرجى الانتظار قليلاً ثم المحاولة مجدداً.';
  if (m.includes('fetch') || m.includes('network')) return 'تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً.';
  return 'حدث خطأ غير متوقع، حاول مجدداً.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      (async () => {
        if (active) setSession(next);
      })();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      loading,
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return translateAuthError(error.message);
        if (!data.session) return 'تم إنشاء الحساب، يمكنك الآن تسجيل الدخول.';
        return null;
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? translateAuthError(error.message) : null;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return error ? translateAuthError(error.message) : null;
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
