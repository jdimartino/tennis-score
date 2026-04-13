import { useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { useJornadas } from '../hooks/useJornadas';
import { getJornadaWinner } from '../hooks/useLocalTeams';

export default function Home() {
  const navigate = useNavigate();
  const { jornadas } = useJornadas();

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-on-surface">
      <Header />

      <main className="px-5 flex flex-col gap-3 -mt-1">
        {/* Section header */}
        <div>
          <p className="lexend text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">Panel</p>
          <h2 className="lexend text-lg font-black text-white leading-tight">Jornadas en Curso</h2>
        </div>

        {/* Loading */}
        {jornadas === undefined && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-pulse">sports_tennis</span>
            <p className="text-on-surface-variant text-sm">Cargando...</p>
          </div>
        )}

        {/* Empty state */}
        {jornadas !== undefined && jornadas.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">sports_tennis</span>
            </div>
            <div className="text-center">
              <p className="lexend font-bold text-on-surface text-sm mb-0.5">No hay jornadas activas</p>
              <p className="text-on-surface-variant text-xs">Toca "Nueva Jornada" para comenzar</p>
            </div>
          </div>
        )}

        {/* Jornada list */}
        {jornadas && jornadas.length > 0 && (
          <div className="flex flex-col gap-3">
            {jornadas.map(j => (
              <JornadaCard key={j.id} jornada={j} onTap={() => navigate(`/jornada/${j.id}`)} />
            ))}
          </div>
        )}

        {/* Nueva Jornada button — always visible at bottom */}
        <div className="mt-2">
          <button
            onClick={() => navigate('/nueva-jornada')}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-black py-4 rounded-2xl shadow-[0_8px_24px_rgba(63,255,139,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Nueva Jornada
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function JornadaCard({ jornada, onTap }) {
  const { myTeam, visitingTeam, date, courts } = jornada;
  const myWins    = courts.filter(c => c.winner === 'mine').length;
  const theirWins = courts.filter(c => c.winner === 'theirs').length;
  const played    = courts.filter(c => c.winner).length;
  const total     = courts.length;
  const needed    = Math.ceil(total / 2);
  const jornadaWinner = getJornadaWinner(courts);
  const inProgress = courts.some(c => !c.winner && c.matchState);

  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-surface-container-high rounded-2xl p-4 border border-white/5 hover:border-white/10 active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Score */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="lexend text-2xl font-black text-primary">{myWins}</span>
          <span className="lexend text-sm font-black text-on-surface-variant opacity-30">—</span>
          <span className="lexend text-2xl font-black text-secondary">{theirWins}</span>
        </div>

        {/* Info + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <p className="lexend font-bold text-sm text-white leading-snug">{myTeam.name}</p>
              <p className="lexend text-xs text-on-surface-variant leading-snug">
                <span className="opacity-50">vs</span> {visitingTeam}
              </p>
              {date && <p className="text-[10px] text-on-surface-variant opacity-50 mt-0.5">{date}</p>}
            </div>
            {jornadaWinner ? (
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${
                jornadaWinner === 'mine' ? 'bg-primary/15 text-primary' : 'bg-error/15 text-error'
              }`}>{jornadaWinner === 'mine' ? 'Ganada' : 'Perdida'}</span>
            ) : inProgress ? (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 bg-secondary/15 text-secondary">En curso</span>
            ) : (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 bg-white/5 text-on-surface-variant">Pendiente</span>
            )}
          </div>
          {/* Court progress bar */}
          <div className="flex gap-0.5">
            {courts.map(c => (
              <div key={c.id} className={`flex-1 h-1 rounded-full ${
                c.winner === 'mine' ? 'bg-primary' : c.winner === 'theirs' ? 'bg-secondary' : c.matchState ? 'bg-secondary/30' : 'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        <span className="material-symbols-outlined text-on-surface-variant shrink-0 text-lg">chevron_right</span>
      </div>
    </button>
  );
}
