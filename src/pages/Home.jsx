import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { useJornadas } from '../hooks/useJornadas';
import { getJornadaWinner } from '../hooks/useLocalTeams';

export default function Home() {
  const navigate = useNavigate();
  const { jornadas, deleteJornada } = useJornadas();

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
              <JornadaCard key={j.id} jornada={j} onTap={() => navigate(`/jornada/${j.id}`)} onDelete={() => deleteJornada(j.id)} />
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

function JornadaCard({ jornada, onTap, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const { myTeam, visitingTeam, date, courts } = jornada;
  const mySetsWon   = (c) => c.matchState?.setsWon?.[0] ?? 0;
  const theirSetsWon = (c) => c.matchState?.setsWon?.[1] ?? 0;
  const myWins    = courts.filter(c => c.winner === 'mine' || (!c.winner && c.matchState?.isMatchOver && mySetsWon(c) > theirSetsWon(c))).length;
  const theirWins = courts.filter(c => c.winner === 'theirs' || (!c.winner && c.matchState?.isMatchOver && mySetsWon(c) < theirSetsWon(c))).length;
  const jornadaWinner = getJornadaWinner(courts);
  const inProgress = courts.some(c => !c.winner && c.matchState && !c.matchState.isMatchOver);

  return (
    <div className="relative w-full bg-surface-container-high rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden">
      {/* Botón de papelera */}
      <button
        onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-on-surface-variant hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-base">delete</span>
      </button>

      {/* Área de navegación */}
      <button
        onClick={onTap}
        className="w-full text-left p-4 pr-10 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          {/* Score */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="lexend text-2xl font-black text-team">{myWins}</span>
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
                  c.winner === 'mine' || (!c.winner && c.matchState?.isMatchOver && (c.matchState.setsWon?.[0] ?? 0) > (c.matchState.setsWon?.[1] ?? 0)) ? 'bg-primary' : c.winner === 'theirs' || (!c.winner && c.matchState?.isMatchOver && (c.matchState.setsWon?.[0] ?? 0) < (c.matchState.setsWon?.[1] ?? 0)) ? 'bg-secondary' : c.matchState ? 'bg-secondary/30' : 'bg-white/10'
                }`} />
              ))}
            </div>
          </div>

          <span className="material-symbols-outlined text-on-surface-variant shrink-0 text-lg">chevron_right</span>
        </div>
      </button>

      {/* Overlay de confirmación */}
      {confirming && (
        <div className="absolute inset-0 bg-surface-container-high/97 rounded-2xl flex flex-col items-center justify-center gap-3 z-20 p-5">
          <span className="material-symbols-outlined text-3xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <p className="lexend font-bold text-sm text-white text-center">¿Eliminar esta jornada?</p>
          <p className="text-xs text-on-surface-variant text-center">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2 rounded-xl bg-white/10 lexend font-bold text-sm text-on-surface-variant active:scale-[0.97] transition-transform"
            >
              Cancelar
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-xl bg-error lexend font-bold text-sm text-white active:scale-[0.97] transition-transform"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
