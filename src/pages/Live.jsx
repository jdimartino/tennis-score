import { useParams } from 'react-router-dom';
import { useJornada } from '../hooks/useJornadas';
import { getJornadaWinner } from '../hooks/useLocalTeams';

function buildScoreString(matchState) {
  if (!matchState) return null;
  const { completedSets = [], current = [0, 0], isMatchOver } = matchState;
  const sets = completedSets.map(s => {
    if (s.superTie) return `ST ${s.superTie[0]}-${s.superTie[1]}`;
    const loser = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
    return `${s.games[0]}-${s.games[1]}${loser !== null ? `(${loser})` : ''}`;
  });
  if (!isMatchOver) {
    if (matchState.setsWon?.[0] === 1 && matchState.setsWon?.[1] === 1 && matchState.superTie) {
      sets.push(`ST ${matchState.superTie.points[0]}-${matchState.superTie.points[1]}`);
    } else if (current[0] === 6 && current[1] === 6 && matchState.tiebreak) {
      sets.push(`6-6 (${matchState.tiebreak.points[0]}-${matchState.tiebreak.points[1]})`);
    } else {
      sets.push(`${current[0]}-${current[1]}`);
    }
  }
  return sets.join('  ');
}

export default function Live() {
  const { id } = useParams();
  const { jornada } = useJornada(id);

  if (jornada === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 font-sans text-on-surface">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">sports_tennis</span>
        <p className="text-on-surface-variant text-sm">Cargando...</p>
      </div>
    );
  }

  if (!jornada) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 font-sans text-on-surface">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">sports_tennis</span>
        <p className="text-on-surface-variant text-sm">Jornada no encontrada</p>
      </div>
    );
  }

  const { myTeam, visitingTeam, date, courts } = jornada;
  const myWins     = courts.filter(c => c.winner === 'mine').length;
  const theirWins  = courts.filter(c => c.winner === 'theirs').length;
  const totalCourts = courts.length;
  const needed     = Math.ceil(totalCourts / 2);
  const jornadaWinner = getJornadaWinner(courts);
  const isLive     = !jornadaWinner;

  return (
    <div className="min-h-screen bg-background pb-12 font-sans text-on-surface">

      {/* Top bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_tennis</span>
          <span className="lexend text-sm font-black text-white tracking-tight">JDMRules</span>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1.5 bg-error/15 border border-error/30 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="lexend text-[10px] font-black uppercase tracking-widest text-error">En Vivo</span>
          </div>
        ) : (
          <span className="lexend text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-3 py-1 bg-white/5 rounded-full">
            Finalizado
          </span>
        )}
      </div>

      <main className="px-5 flex flex-col gap-4">

        {/* Teams + date */}
        <div className="text-center">
          <h2 className="lexend text-base font-black text-white leading-tight">
            {myTeam.name} <span className="text-on-surface-variant font-normal opacity-50 text-sm">vs</span> {visitingTeam}
          </h2>
          {date && <p className="text-on-surface-variant text-xs mt-0.5 opacity-60">{date}</p>}
        </div>

        {/* Global score card */}
        <div className="bg-surface-container-high rounded-[2rem] p-5 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <p className="lexend text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 text-center">
            Marcador de Jornada
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="lexend text-5xl font-black text-primary">{myWins}</span>
              <span className="lexend text-xs font-bold text-on-surface truncate max-w-full text-center">{myTeam.name}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="lexend text-2xl font-black text-on-surface-variant">—</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">de {needed}</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="lexend text-5xl font-black text-secondary">{theirWins}</span>
              <span className="lexend text-xs font-bold text-on-surface truncate max-w-full text-center">{visitingTeam}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 flex gap-1">
            {courts.map(c => (
              <div
                key={c.id}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  c.winner === 'mine'
                    ? 'bg-primary'
                    : c.winner === 'theirs'
                      ? 'bg-secondary'
                      : c.matchState
                        ? 'bg-secondary/30'
                        : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Winner banner */}
        {jornadaWinner && (
          <div className={`rounded-2xl p-4 text-center ${jornadaWinner === 'mine' ? 'bg-primary/15 border border-primary/30' : 'bg-error/15 border border-error/30'}`}>
            <span
              className="material-symbols-outlined text-3xl mb-1"
              style={{ fontVariationSettings: "'FILL' 1", color: jornadaWinner === 'mine' ? '#3fff8b' : '#ff5449' }}
            >
              {jornadaWinner === 'mine' ? 'emoji_events' : 'sentiment_dissatisfied'}
            </span>
            <p className="lexend font-black text-lg text-white">
              {jornadaWinner === 'mine' ? `¡${myTeam.name} gana la jornada!` : `${visitingTeam} gana la jornada`}
            </p>
            <p className="text-on-surface-variant text-xs mt-1">{myWins} – {theirWins}</p>
          </div>
        )}

        {/* Court list — read-only */}
        <div className="flex flex-col gap-3">
          {courts.map(court => (
            <LiveCourtRow
              key={court.id}
              court={court}
              myTeamName={myTeam.name}
              visitingTeam={visitingTeam}
            />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant/30 text-[10px] mt-2">
          Actualización en tiempo real · JDMRules
        </p>
      </main>
    </div>
  );
}

function LiveCourtRow({ court, myTeamName, visitingTeam }) {
  const isDoubles  = court.type === 'doubles';
  const won        = court.winner === 'mine';
  const lost       = court.winner === 'theirs';
  const inProgress = !court.winner && !!court.matchState;
  const pending    = !court.winner && !court.matchState;

  const playerDisplay = court.myPlayers.filter(Boolean).join(' / ') || '—';
  const scoreString   = buildScoreString(court.matchState);

  return (
    <div className={`w-full bg-surface-container-high rounded-2xl p-4 border transition-colors ${
      won  ? 'border-primary/30 bg-primary/5'
           : lost ? 'border-error/20 bg-error/5'
           : 'border-white/5'
    }`}>
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          won ? 'bg-primary/20' : lost ? 'bg-error/20' : inProgress ? 'bg-secondary/15' : 'bg-surface-container-low'
        }`}>
          {won        && <span className="material-symbols-outlined text-primary"   style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          {lost       && <span className="material-symbols-outlined text-error"     style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>}
          {inProgress && <span className="material-symbols-outlined text-secondary animate-pulse">timer</span>}
          {pending    && <span className={`material-symbols-outlined ${isDoubles ? 'text-primary/40' : 'text-secondary/40'}`}>{isDoubles ? 'group' : 'person'}</span>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="lexend font-bold text-sm text-on-surface">{court.label}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              isDoubles ? 'bg-primary/10 text-primary/70' : 'bg-secondary/10 text-secondary/70'
            }`}>
              {isDoubles ? 'D' : 'S'}
            </span>
          </div>
          <p className="text-on-surface-variant text-xs mt-0.5 truncate">{playerDisplay}</p>
        </div>

        {/* Score / status */}
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2">
            {won        && <span className="lexend text-xs font-bold text-primary">GANADO</span>}
            {lost       && <span className="lexend text-xs font-bold text-error">PERDIDO</span>}
            {inProgress && <span className="lexend text-xs font-bold text-secondary">EN CURSO</span>}
            {pending    && <span className="lexend text-xs text-on-surface-variant">Pendiente</span>}
          </div>
          {scoreString && (
            <span className={`lexend text-[11px] font-bold tracking-wide ${
              won ? 'text-primary/70' : lost ? 'text-error/70' : 'text-on-surface-variant'
            }`}>
              {scoreString}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
