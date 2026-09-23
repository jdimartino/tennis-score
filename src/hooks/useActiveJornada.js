import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';

const JORNADA_DOC = doc(db, 'jornadasScore', 'active');

/**
 * Real-time active jornada hook backed by Firestore.
 * All devices subscribed will see updates instantly.
 */
export function useActiveJornada() {
  const [jornada, setJornada] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onSnapshot(JORNADA_DOC, (snap) => {
      setJornada(snap.exists() ? snap.data() : null);
    });
    return unsub;
  }, []);

  const saveJornada = useCallback(async (data) => {
    await setDoc(JORNADA_DOC, data);
  }, []);

  const updateCourt = useCallback(async (courtId, patch) => {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(JORNADA_DOC);
      if (!snap.exists()) return;
      const active = snap.data();
      const updatedCourts = active.courts.map(c =>
        c.id === courtId ? { ...c, ...patch } : c
      );
      transaction.set(JORNADA_DOC, { ...active, courts: updatedCourts });
    });
  }, []);

  const clearJornada = useCallback(async () => {
    await deleteDoc(JORNADA_DOC);
  }, []);

  return { jornada, saveJornada, updateCourt, clearJornada };
}
