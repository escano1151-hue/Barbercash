import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useServices } from './lib/useServices';
import { getTheme, type ThemeId } from './lib/themes';
import { Dashboard } from './components/Dashboard';
import { Stats } from './components/Stats';
import { History } from './components/History';
import { RegisterForm } from './components/RegisterForm';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav, type Tab } from './components/BottomNav';

function App() {
  const {
    services,
    settings,
    loading,
    error,
    addService,
    deleteService,
    updateSettings,
    deleteAllServices,
  } = useServices();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  const percentage = settings?.barber_percentage ?? 80;
  const themeId = (settings?.theme ?? 'gold') as ThemeId;
  const theme = getTheme(themeId);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-rgb', theme.accentRgba);
    root.style.setProperty('--accent-soft', theme.accentSoft);
  }, [theme]);

  const showError = error && !dismissedError;

  const handleRegister = () => {
    setRegisterOpen(true);
    if (activeTab === 'register') setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {showError && (
        <div className="fixed left-1/2 top-4 z-50 flex max-w-md items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-lg">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setDismissedError(true)}>
            <X size={16} />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-md px-4 pt-6">
        {loading ? (
          <div className="flex h-[70vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
              <p className="text-sm text-zinc-500">Cargando...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <Dashboard
                services={services}
                percentage={percentage}
                onRegister={handleRegister}
              />
            )}
            {activeTab === 'stats' && (
              <Stats services={services} percentage={percentage} />
            )}
            {activeTab === 'history' && (
              <History
                services={services}
                percentage={percentage}
                onDelete={deleteService}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                services={services}
                onUpdateSettings={updateSettings}
                onDeleteAll={deleteAllServices}
              />
            )}
          </>
        )}
      </main>

      <RegisterForm
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onAdd={addService}
        percentage={percentage}
      />

      <BottomNav
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'register') setDismissedError(false);
        }}
        onRegister={handleRegister}
      />
    </div>
  );
}

export default App;
