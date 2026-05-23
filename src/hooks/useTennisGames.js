import { useReducer, useCallback } from 'react';

function createInitialState(config = {}) {
  const { localTeam = 'Local', visitingTeam = 'Visitante', bestOf = 3, savedState = null } = config;
  if (savedState) return savedState;
  return {
    localTeam,
    visitingTeam,
    bestOf,
    setsToWin: Math.ceil(bestOf / 2),
    setsWon: [0, 0],
    completedSets: [],
    current: [0, 0],
    tiebreak: { points: [0, 0] },
    superTie: { points: [0, 0] },
    isMatchOver: false,
    winner: null,
    pendingSet: null,
  };
}

function checkSetWinner(g0, g1) {
  if (g0 >= 6 && g0 - g1 >= 2) return 0;
  if (g1 >= 6 && g1 - g0 >= 2) return 1;
  if (g0 === 7 && g1 === 6) return 0;
  if (g1 === 7 && g0 === 6) return 1;
  return null;
}

// Gana el primero en llegar a `target` con al menos 2 puntos de ventaja
function checkTieWinner(p0, p1, target) {
  if (p0 >= target && p0 - p1 >= 2) return 0;
  if (p1 >= target && p1 - p0 >= 2) return 1;
  return null;
}

function reducer(state, action) {
  switch (action.type) {

    case 'ADD_GAME': {
      if (state.isMatchOver || state.pendingSet) return state;
      if (state.setsWon[0] === 1 && state.setsWon[1] === 1) return state;
      const player = action.player;
      const opp = 1 - player;
      const newCurrent = [...state.current];
      newCurrent[player] += 1;

      if (newCurrent[player] > 7) return state;
      if (newCurrent[player] === 7 && newCurrent[opp] < 5) return state;

      const setWinner = checkSetWinner(newCurrent[0], newCurrent[1]);

      if (setWinner !== null) {
        return {
          ...state,
          current: newCurrent,
          pendingSet: { player: setWinner, type: 'game', prevCurrent: [...state.current] },
        };
      }

      return { ...state, current: newCurrent };
    }

    case 'REMOVE_GAME': {
      if (state.isMatchOver || state.pendingSet) return state;
      if (state.setsWon[0] === 1 && state.setsWon[1] === 1) return state;
      const player = action.player;
      const newCurrent = [...state.current];
      if (newCurrent[player] === 0) return state;
      newCurrent[player] -= 1;
      return { ...state, current: newCurrent };
    }

    // ── TIE (tiebreak de set a 7 puntos) ──────────────────────────
    case 'ADD_TIE_POINT': {
      if (state.isMatchOver || state.pendingSet) return state;
      const player = action.player;
      const newPoints = [...state.tiebreak.points];
      newPoints[player] += 1;

      const tieWinner = checkTieWinner(newPoints[0], newPoints[1], 7);

      if (tieWinner !== null) {
        return {
          ...state,
          tiebreak: { points: newPoints },
          pendingSet: { player: tieWinner, type: 'tiebreak', prevTiebreak: [...state.tiebreak.points] },
        };
      }

      return { ...state, tiebreak: { points: newPoints } };
    }

    case 'REMOVE_TIE_POINT': {
      if (state.isMatchOver || state.pendingSet) return state;
      const player = action.player;
      const newPoints = [...state.tiebreak.points];
      if (newPoints[player] === 0) return state;
      newPoints[player] -= 1;
      return { ...state, tiebreak: { points: newPoints } };
    }

    // ── SUPER TIE (partido 1-1, a 10 puntos) ──────────────────────
    case 'ADD_SUPERTIE_POINT': {
      if (state.isMatchOver || state.pendingSet) return state;
      const player = action.player;
      const newPoints = [...state.superTie.points];
      newPoints[player] += 1;

      const superWinner = checkTieWinner(newPoints[0], newPoints[1], 10);

      if (superWinner !== null) {
        return {
          ...state,
          superTie: { points: newPoints },
          pendingSet: { player: superWinner, type: 'supertie', prevSuperTie: [...state.superTie.points] },
        };
      }

      return { ...state, superTie: { points: newPoints } };
    }

    case 'REMOVE_SUPERTIE_POINT': {
      if (state.isMatchOver || state.pendingSet) return state;
      const player = action.player;
      const newPoints = [...state.superTie.points];
      if (newPoints[player] === 0) return state;
      newPoints[player] -= 1;
      return { ...state, superTie: { points: newPoints } };
    }

    case 'CONFIRM_SET': {
      if (!state.pendingSet) return state;
      const { player, type } = state.pendingSet;
      const newSetsWon = [...state.setsWon];
      newSetsWon[player] += 1;

      let newCompleted;
      if (type === 'game') {
        newCompleted = [...state.completedSets, { games: [...state.current] }];
      } else if (type === 'tiebreak') {
        const tieGames = player === 0 ? [7, 6] : [6, 7];
        newCompleted = [...state.completedSets, { games: tieGames, tiebreak: [...state.tiebreak.points] }];
      } else if (type === 'supertie') {
        newCompleted = [...state.completedSets, { superTie: [...state.superTie.points] }];
      }

      if (newSetsWon[player] >= state.setsToWin) {
        return {
          ...state,
          setsWon: newSetsWon,
          completedSets: newCompleted,
          current: [0, 0],
          tiebreak: { points: [0, 0] },
          superTie: { points: [0, 0] },
          isMatchOver: true,
          winner: player,
          pendingSet: null,
        };
      }

      return {
        ...state,
        setsWon: newSetsWon,
        completedSets: newCompleted,
        current: [0, 0],
        tiebreak: { points: [0, 0] },
        superTie: { points: [0, 0] },
        pendingSet: null,
      };
    }

    case 'CANCEL_SET': {
      if (!state.pendingSet) return state;
      const { type: cancelType } = state.pendingSet;
      if (cancelType === 'game') {
        return { ...state, current: [...state.pendingSet.prevCurrent], pendingSet: null };
      }
      if (cancelType === 'tiebreak') {
        return { ...state, tiebreak: { points: [...state.pendingSet.prevTiebreak] }, pendingSet: null };
      }
      if (cancelType === 'supertie') {
        return { ...state, superTie: { points: [...state.pendingSet.prevSuperTie] }, pendingSet: null };
      }
      return state;
    }

    case 'REMOVE_SET': {
      const { setIndex } = action;
      const set = state.completedSets[setIndex];
      if (!set) return state;

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

      return {
        ...state,
        setsWon: newSetsWon,
        completedSets: newCompleted,
        current: [0, 0],
        tiebreak: { points: [0, 0] },
        superTie: { points: [0, 0] },
        isMatchOver: matchStillOver,
        winner: matchStillOver ? (newSetsWon[0] >= state.setsToWin ? 0 : 1) : null,
      };
    }

    case 'RESET':
      return createInitialState(action.config);

    case 'UPDATE_SET_SCORE': {
      const { setIndex, games } = action;
      const newCompleted = [...state.completedSets];
      newCompleted[setIndex] = { ...newCompleted[setIndex], games };
      return { ...state, completedSets: newCompleted };
    }

    case 'UPDATE_TIE_SCORE': {
      const { setIndex, games, tiebreak } = action;
      const newCompleted = [...state.completedSets];
      newCompleted[setIndex] = { ...newCompleted[setIndex], games, tiebreak };
      return { ...state, completedSets: newCompleted };
    }

    case 'UPDATE_SUPERTIE_SCORE': {
      const { setIndex, superTie } = action;
      const newCompleted = [...state.completedSets];
      newCompleted[setIndex] = { ...newCompleted[setIndex], superTie };
      return { ...state, completedSets: newCompleted };
    }

    default:
      return state;
  }
}

export function useTennisGames(config) {
  const [state, dispatch] = useReducer(reducer, config, createInitialState);

  const addGame         = useCallback((player) => dispatch({ type: 'ADD_GAME', player }), []);
  const removeGame      = useCallback((player) => dispatch({ type: 'REMOVE_GAME', player }), []);
  const addTiePoint     = useCallback((player) => dispatch({ type: 'ADD_TIE_POINT', player }), []);
  const removeTiePoint  = useCallback((player) => dispatch({ type: 'REMOVE_TIE_POINT', player }), []);
  const addSuperTiePoint    = useCallback((player) => dispatch({ type: 'ADD_SUPERTIE_POINT', player }), []);
  const removeSuperTiePoint = useCallback((player) => dispatch({ type: 'REMOVE_SUPERTIE_POINT', player }), []);
  const reset           = useCallback((newConfig) => dispatch({ type: 'RESET', config: newConfig }), []);
  const confirmSet      = useCallback(() => dispatch({ type: 'CONFIRM_SET' }), []);
  const cancelSet       = useCallback(() => dispatch({ type: 'CANCEL_SET' }), []);
  const removeSet       = useCallback((setIndex) => dispatch({ type: 'REMOVE_SET', setIndex }), []);
  const updateSetScore      = useCallback((setIndex, games) => dispatch({ type: 'UPDATE_SET_SCORE', setIndex, games }), []);
  const updateTieScore      = useCallback((setIndex, games, tiebreak) => dispatch({ type: 'UPDATE_TIE_SCORE', setIndex, games, tiebreak }), []);
  const updateSuperTieScore = useCallback((setIndex, superTie) => dispatch({ type: 'UPDATE_SUPERTIE_SCORE', setIndex, superTie }), []);

  return { state, addGame, removeGame, addTiePoint, removeTiePoint, addSuperTiePoint, removeSuperTiePoint, reset, confirmSet, cancelSet, removeSet, updateSetScore, updateTieScore, updateSuperTieScore };
}

export function getSetStatus(state) {
  if (state.isMatchOver) {
    return state.winner === 0
      ? `${state.localTeam} gana`
      : `${state.visitingTeam} gana`;
  }
  const setNum = state.completedSets.length + 1;
  const { current, setsWon } = state;

  if (setsWon[0] === 1 && setsWon[1] === 1) return 'Super Tie';
  if (current[0] === 6 && current[1] === 6) return `Set ${setNum} · TIE`;
  return `Set ${setNum}`;
}
