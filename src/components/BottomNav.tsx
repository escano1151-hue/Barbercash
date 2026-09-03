import { Home, BarChart3, Plus, Settings as SettingsIcon, ClipboardList } from 'lucide-react';

export type Tab = 'home' | 'stats' | 'register' | 'history' | 'settings';

type BottomNavProps = {
  active: Tab;
  onChange: (tab: Tab) => void;
  onRegister: () => void;
};

export function BottomNav({ active, onChange, onRegister }: BottomNavProps) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'register', label: 'Registrar', icon: Plus },
    { id: 'history', label: 'Historial', icon: ClipboardList },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-black/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          if (item.id === 'register') {
            return (
              <button
                key={item.id}
                onClick={onRegister}
                className="flex flex-1 flex-col items-center gap-1 pt-1"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-black shadow-accent transition-transform active:scale-90">
                  <Icon size={22} strokeWidth={2.5} />
                </span>
                <span className="text-[9px] font-semibold text-zinc-400">{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="flex flex-1 flex-col items-center gap-1 pt-2"
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-accent' : 'text-zinc-500'}
              />
              <span
                className={`text-[9px] font-semibold ${isActive ? 'text-accent' : 'text-zinc-500'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
