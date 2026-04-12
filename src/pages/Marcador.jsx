import { useLocation, useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { useTennisGames, getSetStatus } from '../hooks/useTennisGames';
import { useActiveJornada } from '../hooks/useActiveJornada';

export default function Marcador() {
  const location = useLocation();
  const navigate = useNavigate();
  const { court, jornada } = location.state || {};
  const { updateCourt } = useActiveJornada();

  const localLabel = court?.myPlayers?.filter(Boolean).join(' / ') || 'Mi Equipo';
  const visitLabel = jornada?.visitingTeam || 'Rival';

  const { state, addGame, removeGame, reset } = useTennisGames({
    localTeam:    localLabel,
    visitingTeam: visitLabel,
    bestOf:       3,
    savedState:   court?.matchState || null,
  });

  const setStatus = getSetStatus(state);

  // Save partial state (mid-match) and go back
  const savePartialAndGoBack = async () => {
    if (court && jornada) {
      await updateCourt(court.id, { matchState: state });
    }
    navigate('/jornada');
  };

  // Save final result (match over) and go back
  const saveFinalAndGoBack = async (winner) => {
    if (court && jornada) {
      await updateCourt(court.id, { winner, matchState: null });
    }
    navigate('/jornada');
  };

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-on-surface">
      <Header />

      <main className="px-4 flex flex-col gap-5 -mt-2">

        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="lexend text-lg font-black text-white">{court?.label || 'Marcador'}</h2>
            <p className="text-on-surface-variant text-xs mt-0.5">
              {jornada?.myTeam?.name} <span className="opacity-40">vs</span> {jornada?.visitingTeam}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {jornada && (
              <button onClick={savePartialAndGoBack} className="p-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              state.isMatchOver ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
            }`}>
              {setStatus}
            </span>
          </div>
        </div>

        {/* Sets won indicator */}
        {state.completedSets.length > 0 && (
          <div className="flex gap-2 justify-center">
            {state.completedSets.map((s, i) => {
              const setWinner = s.games[0] > s.games[1] ? 0 : 1;
              return (
                <div key={i} className="bg-surface-container-high rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
                  <span className={`lexend font-bold ${setWinner === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{s.games[0]}</span>
                  <span className="text-on-surface-variant opacity-40">–</span>
                  <span className={`lexend font-bold ${setWinner === 1 ? 'text-secondary' : 'text-on-surface-variant'}`}>{s.games[1]}</span>
                  <span className="text-on-surface-variant opacity-30 text-[10px] ml-1">S{i + 1}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Scoreboard Card */}
        {!state.isMatchOver && (
          <div className="bg-surface-container-high rounded-[2rem] p-5 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <p className="lexend text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center mb-5">
              Set {state.completedSets.length + 1}
              {state.current[0] === 6 && state.current[1] === 6 && (
                <span className="ml-2 text-error">· Tiebreak</span>
              )}
            </p>

            <div className="flex flex-col gap-4">
              <PlayerRow
                label={localLabel}
                games={state.current[0]}
                setsWon={state.setsWon[0]}
                isLocal={true}
                onAdd={() => addGame(0)}
                onRemove={() => removeGame(0)}
              />
              <div className="w-full h-px bg-white/5" />
              <PlayerRow
                label={visitLabel}
                games={state.current[1]}
                setsWon={state.setsWon[1]}
                isLocal={false}
                onAdd={() => addGame(1)}
                onRemove={() => removeGame(1)}
              />
            </div>
          </div>
        )}

        {/* Match Over */}
        {state.isMatchOver && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="bg-surface-container-high rounded-[2rem] p-6 border border-white/5 text-center">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <h3 className="lexend text-xl font-black text-white mt-2">
                {state.winner === 0 ? localLabel : visitLabel}
              </h3>
              <p className="text-on-surface-variant text-sm mt-1">Ganador del partido</p>
              <div className="flex justify-center gap-3 mt-3">
                {state.completedSets.map((s, i) => (
                  <span key={i} className="lexend text-sm font-bold text-on-surface-variant">
                    {s.games[0]}–{s.games[1]}
                  </span>
                ))}
              </div>
            </div>

            {jornada ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => saveFinalAndGoBack(state.winner === 0 ? 'mine' : 'theirs')}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
                >
                  Guardar y Volver
                </button>
                <button
                  onClick={() => reset({ localTeam: localLabel, visitingTeam: visitLabel, bestOf: 3 })}
                  className="bg-surface-container-low text-on-surface lexend font-bold py-4 rounded-2xl hover:bg-surface-container-highest transition-colors"
                >
                  Revancha
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => reset({ localTeam: localLabel, visitingTeam: visitLabel, bestOf: 3 })}
                  className="bg-surface-container-low text-on-surface lexend font-bold py-4 rounded-2xl"
                >
                  Revancha
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-bold py-4 rounded-2xl"
                >
                  Nuevo Partido
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sets progress + save partial button */}
        {!state.isMatchOver && (
          <>
            <div className="flex items-center justify-center gap-3 mt-1">
              <SetDots won={state.setsWon[0]} total={state.setsToWin || 2} isLocal={true}  label={localLabel} />
              <span className="text-on-surface-variant opacity-30 text-xs">vs</span>
              <SetDots won={state.setsWon[1]} total={state.setsToWin || 2} isLocal={false} label={visitLabel} />
            </div>
            {jornada && (
              <button
                onClick={savePartialAndGoBack}
                className="w-full bg-surface-container-low text-on-surface-variant lexend font-bold py-3 rounded-2xl hover:bg-surface-container-highest transition-colors active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-base">save</span>
                Guardar y Volver
              </button>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function PlayerRow({ label, games, setsWon, isLocal, onAdd, onRemove }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 shrink-0">
        {[0, 1].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full ${
            i < setsWon
              ? isLocal ? 'bg-primary' : 'bg-secondary'
              : 'bg-white/10'
          }`} />
        ))}
      </div>
      <span className={`lexend font-bold text-sm flex-1 truncate ${isLocal ? 'text-primary' : 'text-secondary'}`}>
        {label}
      </span>
      <button
        onClick={onRemove}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
          isLocal
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
        }`}
      >
        <span className="material-symbols-outlined text-lg">remove</span>
      </button>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
        isLocal ? 'bg-primary/15' : 'bg-secondary/15'
      }`}>
        <span className={`lexend font-black text-3xl ${isLocal ? 'text-primary' : 'text-secondary'}`}>
          {games}
        </span>
      </div>
      <button
        onClick={onAdd}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
          isLocal
            ? 'bg-primary/20 text-primary hover:bg-primary/30'
            : 'bg-secondary/20 text-secondary hover:bg-secondary/30'
        }`}
      >
        <span className="material-symbols-outlined text-lg">add</span>
      </button>
    </div>
  );
}

function SetDots({ won, total, isLocal }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
          i < won
            ? isLocal ? 'bg-primary' : 'bg-secondary'
            : 'bg-white/10'
        }`} />
      ))}
    </div>
  );
}
