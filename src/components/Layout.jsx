import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
  return (
    <header className="pt-8 pb-3 px-5 bg-gradient-to-b from-background to-transparent z-10 relative">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <span className="lexend text-primary font-bold text-[10px]">JDM</span>
          </div>
          <div>
            <h1 className="lexend text-xl font-extrabold tracking-tight text-white leading-none">
              JDMRules
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
              <p className="font-['Inter'] text-primary font-semibold tracking-[0.15em] uppercase text-[9px]">
                Como va la Jornada?
              </p>
            </div>
          </div>
        </div>
        <span className="text-2xl select-none">🎾</span>
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
    { path: '/',           icon: 'home',          label: 'Inicio',   fill: true },
    { path: '/historial',  icon: 'history',       label: 'Historial', fill: false },
    { path: '/nueva-jornada', icon: 'add_circle', label: 'Nueva',    fill: true },
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
