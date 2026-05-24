import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { useTennisGames, getSetStatus } from '../hooks/useTennisGames';
import { useJornada } from '../hooks/useJornadas';

export default function Marcador() {
  const location = useLocation();
  const navigate = useNavigate();
  const { court, jornada, returnTo = '/' } = location.state || {};
  const { updateCourt } = useJornada(jornada?.id);

  const localLabel = court?.myPlayers?.filter(Boolean).join(' / ') || 'Mi Equipo';
  const visitLabel = jornada?.visitingTeam || 'Rival';

  const { state, addGame, removeGame, addTiePoint, removeTiePoint, addSuperTiePoint, removeSuperTiePoint, reset, confirmSet, cancelSet, removeSet, updateSetScore, updateTieScore, updateSuperTieScore } = useTennisGames({
    localTeam:    localLabel,
    visitingTeam: visitLabel,
    bestOf:       3,
    savedState:   court?.matchState || null,
  });

  const setStatus = getSetStatus(state);
  const isTiebreak = !state.isMatchOver && state.current[0] === 6 && state.current[1] === 6 && !(state.setsWon[0] === 1 && state.setsWon[1] === 1);
  const isSuperTie = !state.isMatchOver && state.setsWon[0] === 1 && state.setsWon[1] === 1;
  const pendingPoints = state.pendingSet
    ? (state.pendingSet.type === 'game' ? state.current :
       state.pendingSet.type === 'tiebreak' ? state.tiebreak.points :
       state.superTie.points)
    : null;

  const isHistorialEdit = jornada?.status === 'finished';
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEditGames = (setIndex, player, delta) => {
    const set = state.completedSets[setIndex];
    const newGames = [...set.games];
    if (newGames[player] + delta < 0) return;
    newGames[player] += delta;

    updateSetScore(setIndex, newGames);

    const newCompleted = [...state.completedSets];
    newCompleted[setIndex] = { ...set, games: newGames };
    const newState = { ...state, completedSets: newCompleted };
    if (court && jornada) {
      updateCourt(court.id, { matchState: newState }, { preserveFinished: isHistorialEdit });
    }
  };

  const handleEditTiebreak = (setIndex, player, delta) => {
    const set = state.completedSets[setIndex];
    const newTiebreak = [...set.tiebreak];
    if (newTiebreak[player] + delta < 0) return;
    newTiebreak[player] += delta;

    updateTieScore(setIndex, set.games, newTiebreak);

    const newCompleted = [...state.completedSets];
    newCompleted[setIndex] = { ...set, tiebreak: newTiebreak };
    const newState = { ...state, completedSets: newCompleted };
    if (court && jornada) {
      updateCourt(court.id, { matchState: newState }, { preserveFinished: isHistorialEdit });
    }
  };

  const handleEditSuperTie = (setIndex, player, delta) => {
    const set = state.completedSets[setIndex];
    const newSuperTie = [...set.superTie];
    if (newSuperTie[player] + delta < 0) return;
    newSuperTie[player] += delta;

    updateSuperTieScore(setIndex, newSuperTie);

    const newCompleted = [...state.completedSets];
    newCompleted[setIndex] = { ...set, superTie: newSuperTie };
    const newState = { ...state, completedSets: newCompleted };
    if (court && jornada) {
      updateCourt(court.id, { matchState: newState }, { preserveFinished: isHistorialEdit });
    }
  };

  const handleDeleteSet = (setIndex) => {
    if (!window.confirm('¿Eliminar este set? Esta acción no se puede deshacer.')) return;
    const set = state.completedSets[setIndex];
    if (!set) return;

    let setWinner;
    if (set.superTie) {
      setWinner = set.superTie[0] > set.superTie[1] ? 0 : 1;
    } else {
      setWinner = set.games[0] > set.games[1] ? 0 : 1;
    }

    const newSetsWon = [...state.setsWon];
    newSetsWon[setWinner] = Math.max(0, newSetsWon[setWinner] - 1);
    const newCompleted = [...state.completedSets];
    newCompleted.splice(setIndex, 1);
    const matchStillOver = newSetsWon[0] >= state.setsToWin || newSetsWon[1] >= state.setsToWin;

    const newState = {
      ...state,
      setsWon: newSetsWon,
      completedSets: newCompleted,
      current: [0, 0],
      tiebreak: { points: [0, 0] },
      superTie: { points: [0, 0] },
      isMatchOver: matchStillOver,
      winner: matchStillOver ? (newSetsWon[0] >= state.setsToWin ? 0 : 1) : null,
    };

    if (court && jornada) {
      updateCourt(court.id, { matchState: newState }, { preserveFinished: isHistorialEdit });
    }
    removeSet(setIndex);
    setEditingIndex(null);
  };

  // Save partial state (mid-match) and go back
  const savePartialAndGoBack = async () => {
    if (state.pendingSet) return;
    if (court && jornada) {
      await updateCourt(court.id, { matchState: state, winner: null }, { preserveFinished: isHistorialEdit });
    }
    navigate(returnTo);
  };

  // Save final result (match over) and go back
  const saveFinalAndGoBack = async (winner) => {
    if (court && jornada) {
      await updateCourt(court.id, { winner, matchState: state }, { preserveFinished: isHistorialEdit });
    }
    navigate(returnTo);
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
              <button onClick={() => {
                if (state.pendingSet) { navigate(returnTo); return; }
                savePartialAndGoBack();
              }} className="p-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-white transition-colors">
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
          <div className="flex gap-2 justify-center flex-wrap">
            {state.completedSets.map((s, i) => {
              if (s.superTie) {
                const stWinner = s.superTie[0] > s.superTie[1] ? 0 : 1;
                const isEditing = editingIndex === i;
                return (
                  <div key={i} className={`bg-amber-500/10 border ${isEditing ? 'border-amber-500' : 'border-amber-500/30'} rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs`}>
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wide mr-1">Super Tie</span>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleEditSuperTie(i, 0, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-amber-500/20 text-amber-400 active:scale-90 transition-all">−</button>
                        <span className="lexend font-bold text-amber-400 w-4 text-center">{s.superTie[0]}</span>
                        <button onClick={() => handleEditSuperTie(i, 0, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-amber-500/20 text-amber-400 active:scale-90 transition-all">+</button>
                        <span className="text-on-surface-variant opacity-40">–</span>
                        <button onClick={() => handleEditSuperTie(i, 1, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-amber-500/20 text-amber-400 active:scale-90 transition-all">−</button>
                        <span className="lexend font-bold text-amber-400 w-4 text-center">{s.superTie[1]}</span>
                        <button onClick={() => handleEditSuperTie(i, 1, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-amber-500/20 text-amber-400 active:scale-90 transition-all">+</button>
                        <button onClick={() => setEditingIndex(null)} className="w-5 h-5 rounded flex items-center justify-center text-amber-400/50 hover:text-amber-400 transition-colors">✕</button>
                        <button onClick={() => handleDeleteSet(i)} className="w-5 h-5 rounded flex items-center justify-center text-error/50 hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`lexend font-bold ${stWinner === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{s.superTie[0]}</span>
                        <span className="text-on-surface-variant opacity-40">–</span>
                        <span className={`lexend font-bold ${stWinner === 1 ? 'text-secondary' : 'text-on-surface-variant'}`}>{s.superTie[1]}</span>
                        <button onClick={() => setEditingIndex(i)} className="w-5 h-5 rounded flex items-center justify-center text-on-surface-variant/30 hover:text-on-surface-variant transition-colors text-[10px]">✏️</button>
                      </>
                    )}
                  </div>
                );
              }
              const setWinner = s.games[0] > s.games[1] ? 0 : 1;
              const loserTieScore = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
              const hasTiebreak = s.tiebreak != null;
              const isEditing = editingIndex === i;
              return (
                <div key={i} className={`bg-surface-container-high rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs ${isEditing ? 'ring-2 ring-primary/40' : ''}`}>
                  {isEditing ? (
                    <>
                      <button onClick={() => handleEditGames(i, 0, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-primary/20 text-primary active:scale-90 transition-all">−</button>
                      <span className={`lexend font-bold w-4 text-center ${setWinner === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{s.games[0]}</span>
                      <button onClick={() => handleEditGames(i, 0, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-primary/20 text-primary active:scale-90 transition-all">+</button>
                      <span className="text-on-surface-variant opacity-40">–</span>
                      <button onClick={() => handleEditGames(i, 1, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-secondary/20 text-secondary active:scale-90 transition-all">−</button>
                      <span className={`lexend font-bold w-4 text-center ${setWinner === 1 ? 'text-secondary' : 'text-on-surface-variant'}`}>{s.games[1]}</span>
                      <button onClick={() => handleEditGames(i, 1, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-secondary/20 text-secondary active:scale-90 transition-all">+</button>
                      {hasTiebreak && (
                        <>
                          <span className="text-on-surface-variant opacity-30 ml-1">(</span>
                          <button onClick={() => handleEditTiebreak(i, 0, -1)} className="w-4 h-4 rounded flex items-center justify-center bg-primary/20 text-primary active:scale-90 transition-all text-[8px]">−</button>
                          <span className="text-on-surface-variant opacity-40 text-[10px] w-3 text-center">{s.tiebreak[0]}</span>
                          <button onClick={() => handleEditTiebreak(i, 0, 1)} className="w-4 h-4 rounded flex items-center justify-center bg-primary/20 text-primary active:scale-90 transition-all text-[8px]">+</button>
                          <span className="text-on-surface-variant opacity-30">–</span>
                          <button onClick={() => handleEditTiebreak(i, 1, -1)} className="w-4 h-4 rounded flex items-center justify-center bg-secondary/20 text-secondary active:scale-90 transition-all text-[8px]">−</button>
                          <span className="text-on-surface-variant opacity-40 text-[10px] w-3 text-center">{s.tiebreak[1]}</span>
                          <button onClick={() => handleEditTiebreak(i, 1, 1)} className="w-4 h-4 rounded flex items-center justify-center bg-secondary/20 text-secondary active:scale-90 transition-all text-[8px]">+</button>
                          <span className="text-on-surface-variant opacity-30">)</span>
                        </>
                      )}
                      <button onClick={() => setEditingIndex(null)} className="w-5 h-5 rounded flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface-variant transition-colors">✕</button>
                      <button onClick={() => handleDeleteSet(i)} className="w-5 h-5 rounded flex items-center justify-center text-error/50 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <span className="text-on-surface-variant opacity-30 text-[10px]">S{i + 1}</span>
                    </>
                  ) : (
                    <>
                      <span className={`lexend font-bold ${setWinner === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{s.games[0]}</span>
                      <span className="text-on-surface-variant opacity-40">–</span>
                      <span className={`lexend font-bold ${setWinner === 1 ? 'text-secondary' : 'text-on-surface-variant'}`}>{s.games[1]}</span>
                      {loserTieScore !== null && (
                        <span className="text-on-surface-variant opacity-40 text-[10px]">({loserTieScore})</span>
                      )}
                      <span className="text-on-surface-variant opacity-30 text-[10px] ml-1">S{i + 1}</span>
                      <button onClick={() => setEditingIndex(i)} className="w-5 h-5 rounded flex items-center justify-center text-on-surface-variant/30 hover:text-on-surface-variant transition-colors text-[10px]">✏️</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="relative">
          {/* Scoreboard Card — Normal mode */}
          {!state.isMatchOver && !isTiebreak && !isSuperTie && (
            <div className="bg-surface-container-high rounded-[2rem] p-5 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <p className="lexend text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center mb-5">
                Set {state.completedSets.length + 1}
              </p>
              <div className="flex flex-col gap-4">
                <PlayerRow label={localLabel} games={state.current[0]} setsWon={state.setsWon[0]} isLocal={true}  onAdd={() => addGame(0)}  onRemove={() => removeGame(0)} />
                <div className="w-full h-px bg-white/5" />
                <PlayerRow label={visitLabel} games={state.current[1]} setsWon={state.setsWon[1]} isLocal={false} onAdd={() => addGame(1)}  onRemove={() => removeGame(1)} />
              </div>
            </div>
          )}

          {/* Scoreboard Card — TIE mode (6-6 in games) */}
          {!state.isMatchOver && isTiebreak && (
            <div className="bg-surface-container-high rounded-[2rem] p-5 border border-error/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-error/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-error text-lg">⚡</span>
                <p className="lexend text-sm font-black uppercase tracking-widest text-error text-center">TIE</p>
                <span className="text-error text-lg">⚡</span>
              </div>
              <p className="lexend text-[10px] text-on-surface-variant text-center mb-5">
                Set {state.completedSets.length + 1} · 6–6 · Primero en llegar a 7 con 2 de ventaja
              </p>
              <div className="flex flex-col gap-4">
                <PlayerRow label={localLabel} games={state.tiebreak.points[0]} setsWon={state.setsWon[0]} isLocal={true}  onAdd={() => addTiePoint(0)}  onRemove={() => removeTiePoint(0)} />
                <div className="w-full h-px bg-white/5" />
                <PlayerRow label={visitLabel} games={state.tiebreak.points[1]} setsWon={state.setsWon[1]} isLocal={false} onAdd={() => addTiePoint(1)}  onRemove={() => removeTiePoint(1)} />
              </div>
            </div>
          )}

          {/* Scoreboard Card — SUPER TIE mode (1-1 in sets) */}
          {!state.isMatchOver && isSuperTie && (
            <div className="bg-surface-container-high rounded-[2rem] p-5 border border-amber-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-amber-400 text-lg">🏆</span>
                <p className="lexend text-sm font-black uppercase tracking-widest text-amber-400 text-center">SUPER TIE</p>
                <span className="text-amber-400 text-lg">🏆</span>
              </div>
              <p className="lexend text-[10px] text-on-surface-variant text-center mb-5">
                Sets 1–1 · Primero en llegar a 10 con 2 de ventaja
              </p>
              <div className="flex flex-col gap-4">
                <PlayerRow label={localLabel} games={state.superTie.points[0]} setsWon={state.setsWon[0]} isLocal={true}  onAdd={() => addSuperTiePoint(0)}  onRemove={() => removeSuperTiePoint(0)} />
                <div className="w-full h-px bg-white/5" />
                <PlayerRow label={visitLabel} games={state.superTie.points[1]} setsWon={state.setsWon[1]} isLocal={false} onAdd={() => addSuperTiePoint(1)}  onRemove={() => removeSuperTiePoint(1)} />
              </div>
            </div>
          )}

          {/* Confirmación de cierre de set */}
          {state.pendingSet && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-3 z-20 p-5">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sports_score</span>
              <p className="lexend font-bold text-sm text-white text-center">¿Cerrar el set con este resultado?</p>
              <p className="lexend font-black text-2xl text-white flex items-center gap-3">
                <span className={state.pendingSet.player === 0 ? 'text-primary' : 'text-on-surface-variant'}>{pendingPoints[0]}</span>
                <span className="text-on-surface-variant/40">–</span>
                <span className={state.pendingSet.player === 1 ? 'text-secondary' : 'text-on-surface-variant'}>{pendingPoints[1]}</span>
              </p>
              <div className="flex gap-2 w-full mt-1">
                <button onClick={cancelSet} className="flex-1 bg-surface-container-low text-on-surface-variant lexend font-bold py-3 rounded-xl active:scale-[0.98] transition-all text-sm">
                  No, modificar
                </button>
                <button onClick={confirmSet} className="flex-1 bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-bold py-3 rounded-xl active:scale-[0.98] transition-all text-sm">
                  Sí, cerrar set
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Match Over */}
        {state.isMatchOver && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="bg-surface-container-high rounded-[2rem] p-6 border border-white/5 text-center">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <h3 className="lexend text-xl font-black text-white mt-2">
                {state.winner === 0 ? localLabel : visitLabel}
              </h3>
              <p className="text-on-surface-variant text-sm mt-1">Ganador del partido</p>
              <div className="flex justify-center gap-3 mt-3 flex-wrap">
                {state.completedSets.map((s, i) => {
                  if (s.superTie) {
                    return (
                      <span key={i} className="lexend text-sm font-bold text-amber-400">
                        ST {s.superTie[0]}–{s.superTie[1]}
                      </span>
                    );
                  }
                  const loser = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
                  return (
                    <span key={i} className="lexend text-sm font-bold text-on-surface-variant">
                      {s.games[0]}–{s.games[1]}{loser !== null ? ` (${loser})` : ''}
                    </span>
                  );
                })}
              </div>
            </div>

            {jornada ? (
              <button
                onClick={() => {
                  if (state.winner === null) return;
                  saveFinalAndGoBack(state.winner === 0 ? 'mine' : 'theirs');
                }}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-primary/30 animate-pulse"
              >
                Guardar y Volver
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-bold py-4 rounded-2xl"
              >
                Nuevo Partido
              </button>
            )}
            {jornada && (
              <button
                onClick={() => reset({ localTeam: localLabel, visitingTeam: visitLabel, bestOf: 3 })}
                className="w-full bg-surface-container-low text-on-surface-variant lexend font-bold py-3 rounded-2xl hover:bg-surface-container-highest transition-colors active:scale-[0.98] text-sm"
              >
                Editar marcador
              </button>
            )}
          </div>
        )}

        {/* Sets progress + save partial button (hidden while set confirmation overlay is shown) */}
        {!state.isMatchOver && !state.pendingSet && (
          <>
            <div className="flex items-center justify-center gap-3 mt-1">
              <SetDots won={state.setsWon[0]} total={state.setsToWin || 2} isLocal={true}  label={localLabel} />
              <span className="text-on-surface-variant opacity-30 text-xs">vs</span>
              <SetDots won={state.setsWon[1]} total={state.setsToWin || 2} isLocal={false} label={visitLabel} />
            </div>
            {jornada && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={savePartialAndGoBack}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-primary/30 animate-pulse flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Guardar y Volver
                </button>
                <button
                  onClick={() => navigate(returnTo)}
                  className="w-full text-on-surface-variant/50 lexend font-bold py-2 rounded-2xl hover:text-on-surface-variant transition-colors active:scale-[0.98] text-sm"
                >
                  Cancelar
                </button>
              </div>
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
