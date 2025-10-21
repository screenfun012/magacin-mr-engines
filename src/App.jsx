import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Login } from '@/components/Login';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/lib/state/authStore';
import { useThemeStore } from '@/lib/state/themeStore';
import { initDatabase } from '@/lib/db/client';
import { runMigrations } from '@/lib/db/migrations';
import { seedDatabase } from '@/lib/db/seed';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { Inventory } from '@/features/inventory/Inventory';
import { Export } from '@/features/export/Export';
import { Admin } from '@/features/admin/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 2,
      staleTime: 500,
      cacheTime: 300000,
    },
  },
});

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeView, setActiveView] = useState('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    async function initApp() {
      try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized');

        await runMigrations();
        console.log('Migrations completed');

        await seedDatabase();
        console.log('Seed completed');

        setIsInitialized(true);
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(error.message || error.toString());
      }
    }

    initApp();
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-xl font-bold mb-2">Greška pri inicijalizaciji</p>
          <p className="text-muted-foreground mb-4">{initError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-red text-white rounded-md">
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Inicijalizacija aplikacije...</p>
          <p className="text-sm text-muted-foreground mt-2">Molimo sačekajte...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'export':
        return <Export />;
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="min-h-full">{renderView()}</div>
      </main>
    </div>
  );
}

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
