import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { AppShell, type PageId } from '@/components/AppShell';
import { AuthScreen } from '@/components/AuthScreen';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdhkarPage } from '@/pages/AdhkarPage';
import { TasbeehPage } from '@/pages/TasbeehPage';
import { ReflectPage } from '@/pages/ReflectPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { SettingsPage } from '@/pages/SettingsPage';

function renderPage(page: PageId, navigate: (p: PageId) => void) {
  switch (page) {
    case 'home':
      return <DashboardPage onNavigate={navigate} />;
    case 'adhkar':
      return <AdhkarPage />;
    case 'tasbeeh':
      return <TasbeehPage />;
    case 'reflect':
      return <ReflectPage />;
    case 'reminders':
      return <RemindersPage />;
    case 'progress':
      return <ProgressPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

function SignedInApp() {
  const [page, setPage] = useState<PageId>('home');
  return (
    <AppShell page={page} onNavigate={setPage}>
      {renderPage(page, setPage)}
    </AppShell>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-700" />
      </div>
    );
  }
  if (!user) return <AuthScreen />;
  return <SignedInApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AuthGate />
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
