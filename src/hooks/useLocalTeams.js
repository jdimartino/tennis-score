import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// ─────────────────── Firestore refs ───────────────────
const TEAMS_DOC = doc(db, 'config', 'teams');
const DEFAULT_LOCAL = [
  { id: 1, name: 'TOL',          league: 'tol' },
  { id: 2, name: 'Club Táchira', league: 'cta' },
];
const DEFAULT_VISITING = [
  { id: 1, name: 'Country Club' },
  { id: 2, name: 'Lagunita C.C.' },
  { id: 3, name: 'Valle Arriba' },
];

// ─────────────── helper: seed Firestore if empty ───────────────
async function seedIfEmpty() {
  const snap = await getDoc(TEAMS_DOC);
  if (!snap.exists()) {
    await setDoc(TEAMS_DOC, {
      local:    DEFAULT_LOCAL,
      visiting: DEFAULT_VISITING,
    });
  }
}
seedIfEmpty();

// ─────────────────── Local Teams Hook ───────────────────
export function useLocalTeams() {
  const [teams, setTeams] = useState(DEFAULT_LOCAL);

  useEffect(() => {
    const unsub = onSnapshot(TEAMS_DOC, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTeams((data.local || []).map(t => ({
          ...t,
          league: t.league === 'cumbres' ? 'tol' : t.league,
        })));
      }
    });
    return unsub;
  }, []);

  const _updateLocal = useCallback(async (newList) => {
    const snap = await getDoc(TEAMS_DOC);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(TEAMS_DOC, { ...current, local: newList }, { merge: true });
  }, []);

  const addTeam = useCallback(async (name, league = 'tol') => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const snap = await getDoc(TEAMS_DOC);
    const list = snap.exists() ? (snap.data().local || []) : [];
    if (list.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return false;
    await _updateLocal([...list, { id: Date.now(), name: trimmed, league }]);
    return true;
  }, [_updateLocal]);

  const removeTeam = useCallback(async (id) => {
    const snap = await getDoc(TEAMS_DOC);
    const list = snap.exists() ? (snap.data().local || []) : [];
    await _updateLocal(list.filter(t => t.id !== id));
  }, [_updateLocal]);

  const editTeam = useCallback(async (id, newName, newLeague) => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    const snap = await getDoc(TEAMS_DOC);
    const list = snap.exists() ? (snap.data().local || []) : [];
    await _updateLocal(list.map(t => t.id === id ? { ...t, name: trimmed, league: newLeague ?? t.league } : t));
    return true;
  }, [_updateLocal]);

  // kept for API compat
  const reload = useCallback(() => {}, []);

  return { teams, addTeam, removeTeam, editTeam, reload };
}

// ─────────────────── Visiting Teams Hook ───────────────────
export function useVisitingTeams() {
  const [teams, setTeams] = useState(DEFAULT_VISITING);

  useEffect(() => {
    const unsub = onSnapshot(TEAMS_DOC, (snap) => {
      if (snap.exists()) {
        setTeams(snap.data().visiting || []);
      }
    });
    return unsub;
  }, []);

  const _updateVisiting = useCallback(async (newList) => {
    const snap = await getDoc(TEAMS_DOC);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(TEAMS_DOC, { ...current, visiting: newList }, { merge: true });
  }, []);

  const addTeam = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const snap = await getDoc(TEAMS_DOC);
    const list = snap.exists() ? (snap.data().visiting || []) : [];
    if (list.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return false;
    await _updateVisiting([...list, { id: Date.now(), name: trimmed }]);
    return true;
  }, [_updateVisiting]);

  const removeTeam = useCallback(async (id) => {
    const snap = await getDoc(TEAMS_DOC);
    const list = snap.exists() ? (snap.data().visiting || []) : [];
    await _updateVisiting(list.filter(t => t.id !== id));
  }, [_updateVisiting]);

  const editTeam = useCallback(async (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    const snap = await getDoc(TEAMS_DOC);
    const list = snap.exists() ? (snap.data().visiting || []) : [];
    await _updateVisiting(list.map(t => t.id === id ? { ...t, name: trimmed } : t));
    return true;
  }, [_updateVisiting]);

  const reload = useCallback(() => {}, []);

  return { teams, addTeam, removeTeam, editTeam, reload };
}

// ─────────────────── League helpers (unchanged) ───────────────────
export function getLeagueLabel(league) {
  if (league === 'tol' || league === 'cumbres') return 'TOL';
  if (league === 'cta') return 'CTA';
  return league?.toUpperCase?.() ?? '';
}

export function getLeagueDetail(league) {
  if (league === 'tol' || league === 'cumbres') return '5 Dobles';
  if (league === 'cta') return '4D + 1S';
  return '';
}

export function getLeagueFormat(league) {
  if (league === 'cta') {
    return [
      { id: 1, type: 'doubles', label: 'Dobles 1' },
      { id: 2, type: 'doubles', label: 'Dobles 2' },
      { id: 3, type: 'doubles', label: 'Dobles 3' },
      { id: 4, type: 'doubles', label: 'Dobles 4' },
      { id: 5, type: 'singles', label: 'Singles'  },
    ];
  }
  // tol / cumbres: all doubles
  return [
    { id: 1, type: 'doubles', label: 'Dobles 1' },
    { id: 2, type: 'doubles', label: 'Dobles 2' },
    { id: 3, type: 'doubles', label: 'Dobles 3' },
    { id: 4, type: 'doubles', label: 'Dobles 4' },
    { id: 5, type: 'doubles', label: 'Dobles 5' },
  ];
}

export function getJornadaWinner(courts) {
  const myWins    = courts.filter(c => c.winner === 'mine').length;
  const theirWins = courts.filter(c => c.winner === 'theirs').length;
  const needed    = Math.ceil(courts.length / 2);
  if (myWins    >= needed) return 'mine';
  if (theirWins >= needed) return 'theirs';
  return null;
}
