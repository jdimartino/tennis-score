import { useParams } from 'react-router-dom';
import ScoreDisplay from '../components/ScoreDisplay';
import { useJornada } from '../hooks/useJornadas';
import { getJornadaWinner } from '../hooks/useLocalTeams';

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
  const isDoubles = court.type === 'doubles';
  const matchIsOver = !!court.matchState?.isMatchOver;
  const mySetsWon   = court.matchState?.setsWon?.[0] ?? 0;
  const theirSetsWon = court.matchState?.setsWon?.[1] ?? 0;
  const won    = court.winner === 'mine' || (!court.winner && matchIsOver && mySetsWon > theirSetsWon);
  const lost   = court.winner === 'theirs' || (!court.winner && matchIsOver && mySetsWon < theirSetsWon);
  const inProgress = !won && !lost && !!court.matchState && !matchIsOver;
  const pending    = !court.winner && !court.matchState;

  const players = court.myPlayers.filter(Boolean);


  return (
    <div className={`w-full bg-surface-container-high rounded-2xl p-5 border transition-colors relative min-h-[170px] ${
      won  ? 'border-primary/30 bg-primary/5'
           : lost ? 'border-error/20 bg-error/5'
           : 'border-white/5'
    }`}>
      {/* Title + D/S badge — top-left corner */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span className="lexend font-bold text-sm text-on-surface">{court.label}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          isDoubles ? 'bg-team/10 text-team/70' : 'bg-secondary/10 text-secondary/70'
        }`}>
          {isDoubles ? 'D' : 'S'}
        </span>
      </div>

      {/* Center content grid */}
      <div className="grid items-center content-center min-h-[110px]" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
        {/* Col 1: Player names */}
        <div>
          {players.length > 0 ? (
            <p className="player-name text-sm truncate leading-snug pr-2">
              {players.map((name, i) => (
                <span key={name}>
                  {i > 0 && <span className="text-on-surface-variant/30 mx-1">·</span>}
                  {name}
                </span>
              ))}
            </p>
          ) : (
            <p className="player-name text-sm truncate leading-snug">—</p>
          )}
        </div>

        {/* Col 2: empty spacer */}
        <div />

        {/* Col 3: Score box + Status pill — right side */}
        <div className="flex flex-col items-end gap-2">
          {court.matchState && (
            <div className="bg-primary/5 rounded-xl px-3 py-1.5 border border-primary/10">
              <ScoreDisplay matchState={court.matchState} status={won ? 'won' : lost ? 'lost' : 'inProgress'} />
            </div>
          )}
          {won && (
            <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-primary/10 text-primary">
              GANADO
            </span>
          )}
          {lost && (
            <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-error/10 text-error">
              PERDIDO
            </span>
          )}
          {inProgress && (
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-secondary/15 text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              EN CURSO
            </span>
          )}
          {pending && (
            <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant/60">
              Pendiente
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
