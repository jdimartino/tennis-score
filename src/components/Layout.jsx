import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
  return (
    <header className="pt-12 pb-6 px-6 bg-gradient-to-b from-background to-transparent z-10 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="lexend text-4xl font-extrabold tracking-tight text-white mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            JDMRules
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <p className="font-['Inter'] text-primary font-semibold tracking-[0.2em] uppercase text-xs">
              Tennis
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low p-2 rounded-2xl border border-white/5 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="lexend text-primary font-bold text-sm">JDM</span>
          </div>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary/10 to-transparent"></div>
    </header>
  );
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/jornada', icon: 'scoreboard', label: 'Jornada', fill: true },
    { path: '/', icon: 'tune', label: 'Config', fill: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-6 pt-2 bg-[#030e20]/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(63,255,139,0.15)] rounded-t-[1.5rem]">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center p-2 px-4 transition-all ${
              isActive
                ? 'text-[#3fff8b] bg-[#3fff8b]/10 rounded-xl'
                : 'text-slate-400 hover:text-[#3fff8b]'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive && item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-['Inter'] uppercase text-[10px] tracking-widest mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
