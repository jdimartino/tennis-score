import { useReducer, useCallback } from 'react';

function createInitialState(config = {}) {
  const { localTeam = 'Local', visitingTeam = 'Visitante', bestOf = 3, savedState = null } = config;
  // Restore from a previously saved partial state
  if (savedState) return savedState;
  return {
    localTeam,
    visitingTeam,
    bestOf,
    setsToWin: Math.ceil(bestOf / 2),
    setsWon: [0, 0],
    completedSets: [],
    current: [0, 0],
    isMatchOver: false,
    winner: null,
  };
}

function checkSetWinner(g0, g1) {
  // Standard: first to 6 with 2-game lead
  if (g0 >= 6 && g0 - g1 >= 2) return 0;
  if (g1 >= 6 && g1 - g0 >= 2) return 1;
  // Tiebreak: 7-6
  if (g0 === 7 && g1 === 6) return 0;
  if (g1 === 7 && g0 === 6) return 1;
  return null;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_GAME': {
      if (state.isMatchOver) return state;
      const player = action.player;
      const opp = 1 - player;
      const newCurrent = [...state.current];
      newCurrent[player] += 1;

      // Cap at 7 (max games in a set including tiebreak)
      if (newCurrent[player] > 7) return state;
      // Can't go above 7-6 situation: if opponent is at 6, can go to 7 but no further
      // if both at 7 that's impossible in normal tennis — cap opponent-side too
      if (newCurrent[player] === 7 && newCurrent[opp] < 6) return state; // 7-x only valid at 7-6

      const setWinner = checkSetWinner(newCurrent[0], newCurrent[1]);

      if (setWinner !== null) {
        // Set is over
        const newSetsWon = [...state.setsWon];
        newSetsWon[setWinner] += 1;
        const newCompleted = [...state.completedSets, { games: newCurrent }];

        if (newSetsWon[setWinner] >= state.setsToWin) {
          return {
            ...state,
            setsWon: newSetsWon,
            completedSets: newCompleted,
            current: [0, 0],
            isMatchOver: true,
            winner: setWinner,
          };
        }
        return {
          ...state,
          setsWon: newSetsWon,
          completedSets: newCompleted,
          current: [0, 0],
        };
      }

      return { ...state, current: newCurrent };
    }

    case 'REMOVE_GAME': {
      if (state.isMatchOver) return state;
      const player = action.player;
      const newCurrent = [...state.current];
      if (newCurrent[player] === 0) return state;
      newCurrent[player] -= 1;
      return { ...state, current: newCurrent };
    }

    case 'RESET':
      return createInitialState(action.config);

    default:
      return state;
  }
}

export function useTennisGames(config) {
  const [state, dispatch] = useReducer(reducer, config, createInitialState);

  const addGame = useCallback((player) => {
    dispatch({ type: 'ADD_GAME', player });
  }, []);

  const removeGame = useCallback((player) => {
    dispatch({ type: 'REMOVE_GAME', player });
  }, []);

  const reset = useCallback((newConfig) => {
    dispatch({ type: 'RESET', config: newConfig });
  }, []);

  return { state, addGame, removeGame, reset };
}

export function getSetStatus(state) {
  if (state.isMatchOver) {
    return state.winner === 0
      ? `${state.localTeam} gana`
      : `${state.visitingTeam} gana`;
  }
  const setNum = state.completedSets.length + 1;
  const { current } = state;
  const g0 = current[0], g1 = current[1];
  if (g0 === 6 && g1 === 6) return `Set ${setNum} · Tiebreak`;
  return `Set ${setNum}`;
}
