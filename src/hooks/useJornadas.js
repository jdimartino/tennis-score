import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, onSnapshot, query, where,
  addDoc, setDoc, getDoc, deleteDoc, runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const jornadasCol = collection(db, 'jornadas');

/**
 * Validate and repair matchState inconsistencies before saving.
 * A set cannot be won without recording it in completedSets.
 */
function validateMatchState(ms) {
  if (!ms) return ms;
  const valid = { ...ms };

  const totalCompleted = valid.completedSets ? valid.completedSets.length : 0;
  const expectedSetsWon = [0, 0];
  if (valid.completedSets) {
    for (const set of valid.completedSets) {
      if (set.superTie) {
        expectedSetsWon[set.superTie[0] > set.superTie[1] ? 0 : 1] += 1;
      } else if (set.games) {
        expectedSetsWon[set.games[0] > set.games[1] ? 0 : 1] += 1;
      }
    }
  }

  if (valid.setsWon) {
    if (valid.setsWon[0] !== expectedSetsWon[0] || valid.setsWon[1] !== expectedSetsWon[1]) {
      valid.setsWon = [...expectedSetsWon];
    }
  }

  const matchShouldBeOver = expectedSetsWon[0] >= (valid.setsToWin || 2)
    || expectedSetsWon[1] >= (valid.setsToWin || 2);

  if (valid.isMatchOver && !matchShouldBeOver) {
    valid.isMatchOver = false;
    valid.winner = null;
  } else if (!valid.isMatchOver && matchShouldBeOver) {
    valid.isMatchOver = true;
    valid.winner = expectedSetsWon[0] > expectedSetsWon[1] ? 0 : 1;
  }

  return valid;
}

/**
 * useJornadas() — real-time list of active jornadas (for Home page).
 */
export function useJornadas() {
  const [jornadas, setJornadas] = useState(undefined); // undefined = loading

  useEffect(() => {
    const q = query(jornadasCol, where('status', '==', 'active'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => d.data());
        list.sort((a, b) => {
          if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
          return 0;
        });
        setJornadas(list);
      },
      (err) => { console.error('useJornadas error:', err); setJornadas([]); }
    );
    return unsub;
  }, []);

  /**
   * createJornada(data) — saves a new jornada doc with auto-generated ID.
   * Returns the generated ID so the caller can navigate to /jornada/:id.
   */
  const createJornada = useCallback(async (data) => {
    const ref = await addDoc(jornadasCol, { ...data, status: 'active', id: '' });
    await setDoc(ref, { id: ref.id }, { merge: true });
    return ref.id;
  }, []);

  const deleteJornada = useCallback(async (id) => {
    const ref = doc(db, 'jornadas', id);
    await deleteDoc(ref);
  }, []);

  return { jornadas, createJornada, deleteJornada };
}

/**
 * useFinishedJornadas() — real-time list of finished jornadas (for Historial page).
 */
export function useFinishedJornadas() {
  const [jornadas, setJornadas] = useState(undefined);

  useEffect(() => {
    const q = query(jornadasCol, where('status', '==', 'finished'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => d.data());
        // Sort newest date first
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setJornadas(list);
      },
      (err) => { console.error('useFinishedJornadas error:', err); setJornadas([]); }
    );
    return unsub;
  }, []);

  return { jornadas };
}

/**
 * useJornada(id) — real-time single jornada (for Jornada detail + Marcador pages).
 */
export function useJornada(id) {
  const [jornada, setJornada] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (!id) { setJornada(null); return; }
    const ref = doc(db, 'jornadas', id);
    const unsub = onSnapshot(
      ref,
      (snap) => { setJornada(snap.exists() ? snap.data() : null); },
      (err) => { console.error('useJornada error:', err); setJornada(null); }
    );
    return unsub;
  }, [id]);

  const updateCourt = useCallback(async (courtId, patch, { preserveFinished = false } = {}) => {
    if (!id) return;
    const ref = doc(db, 'jornadas', id);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      const updatedCourts = data.courts.map(c => {
        if (c.id !== courtId) return c;
        const merged = { ...c, ...patch };
        if (merged.matchState) {
          merged.matchState = validateMatchState(merged.matchState);
        }
        return merged;
      });
      const allCourtsFinished = updatedCourts.every(c => c.winner != null);
      const statusPatch = preserveFinished
        ? { status: 'finished' }
        : { status: allCourtsFinished ? 'finished' : 'active' };
      transaction.set(ref, { ...data, courts: updatedCourts, ...statusPatch });
    });
  }, [id]);

  const finishJornada = useCallback(async () => {
    if (!id) return;
    const ref = doc(db, 'jornadas', id);
    await setDoc(ref, { status: 'finished' }, { merge: true });
  }, [id]);

  return { jornada, updateCourt, finishJornada };
}
