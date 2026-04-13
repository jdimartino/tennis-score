import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, onSnapshot, query, where,
  addDoc, setDoc, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const jornadasCol = collection(db, 'jornadas');

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

  return { jornadas, createJornada };
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

  const updateCourt = useCallback(async (courtId, patch) => {
    if (!id) return;
    const ref = doc(db, 'jornadas', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const updatedCourts = data.courts.map(c =>
      c.id === courtId ? { ...c, ...patch } : c
    );
    const allCourtsFinished = updatedCourts.every(c => c.winner != null);
    const statusPatch = { status: allCourtsFinished ? 'finished' : 'active' };
    await setDoc(ref, { ...data, courts: updatedCourts, ...statusPatch });
  }, [id]);

  const finishJornada = useCallback(async () => {
    if (!id) return;
    const ref = doc(db, 'jornadas', id);
    await setDoc(ref, { status: 'finished' }, { merge: true });
  }, [id]);

  return { jornada, updateCourt, finishJornada };
}
