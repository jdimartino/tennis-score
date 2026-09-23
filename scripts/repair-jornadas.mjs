import { initializeApp } from '../node_modules/firebase/app/dist/index.mjs';
import {
  getFirestore, collection, getDocs, doc, writeBatch,
} from '../node_modules/firebase/firestore/dist/index.mjs';

const firebaseConfig = {
  apiKey: 'AIzaSyAvU8uKaivoZH_401zpXyM5-OOGgi5OGcw',
  authDomain: 'torneos-tenis-jdm.firebaseapp.com',
  projectId: 'torneos-tenis-jdm',
  storageBucket: 'torneos-tenis-jdm.firebasestorage.app',
  messagingSenderId: '951550758841',
  appId: '1:951550758841:web:b4baab45dde503d0717068',
};

const app = initializeApp(firebaseConfig, 'repair');
const db = getFirestore(app);

function validateMatchState(ms) {
  if (!ms) return ms;
  const valid = { ...ms };

  const completedSets = valid.completedSets || [];
  const totalCompleted = completedSets.length;
  const expectedSetsWon = [0, 0];

  for (const set of completedSets) {
    if (set.superTie) {
      expectedSetsWon[set.superTie[0] > set.superTie[1] ? 0 : 1] += 1;
    } else if (set.games) {
      expectedSetsWon[set.games[0] > set.games[1] ? 0 : 1] += 1;
    }
  }

  const setsWonChanged = valid.setsWon
    && (valid.setsWon[0] !== expectedSetsWon[0] || valid.setsWon[1] !== expectedSetsWon[1]);

  if (setsWonChanged) {
    valid.setsWon = [...expectedSetsWon];
  }

  const setsToWin = valid.setsToWin || 2;
  const matchShouldBeOver =
    expectedSetsWon[0] >= setsToWin || expectedSetsWon[1] >= setsToWin;

  const fixedIsMatchOver = valid.isMatchOver !== matchShouldBeOver;
  if (fixedIsMatchOver) {
    valid.isMatchOver = matchShouldBeOver;
    valid.winner = matchShouldBeOver
      ? (expectedSetsWon[0] > expectedSetsWon[1] ? 0 : 1)
      : null;
  }

  const winnerMismatch = valid.isMatchOver && valid.winner === null;
  if (winnerMismatch) {
    valid.winner = expectedSetsWon[0] > expectedSetsWon[1] ? 0 : 1;
  }

  const changes = {};
  if (setsWonChanged) changes.setsWon = valid.setsWon;
  if (fixedIsMatchOver) { changes.isMatchOver = valid.isMatchOver; changes.winner = valid.winner; }
  if (winnerMismatch) changes.winner = valid.winner;

  return { valid, changed: setsWonChanged || fixedIsMatchOver || winnerMismatch, changes };
}

async function repair() {
  const snap = await getDocs(collection(db, 'jornadasScore'));
  console.log(`Encontrados ${snap.size} documentos en jornadas\n`);

  let totalRepaired = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const courts = data.courts || [];
    let docChanged = false;
    const newCourts = [];

    for (const court of courts) {
      if (!court.matchState) {
        newCourts.push(court);
        continue;
      }

      const { valid, changed, changes } = validateMatchState(court.matchState);
      if (changed) {
        console.log(`⚠️  ${d.id} / cancha ${court.id} (${court.label}):`);
        console.log(`   Antes: completedSets=${JSON.stringify(court.matchState.completedSets)}, setsWon=${JSON.stringify(court.matchState.setsWon)}, isMatchOver=${court.matchState.isMatchOver}, winner=${court.matchState.winner}`);
        console.log(`   Desp:  ${JSON.stringify(changes)}`);
        docChanged = true;
      }

      // Also check court-level winner vs matchState
      if (court.winner && court.matchState && !court.matchState.isMatchOver) {
        console.log(`⚠️  ${d.id} / cancha ${court.id} (${court.label}):`);
        console.log(`   Court winner="${court.winner}" pero matchState.isMatchOver=false → limpiando winner`);
        docChanged = true;
        newCourts.push({ ...court, winner: null, matchState: valid });
      } else {
        newCourts.push(changed ? { ...court, matchState: valid } : court);
      }
    }

    if (docChanged) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'jornadasScore', d.id), { ...data, courts: newCourts });
      await batch.commit();
      totalRepaired++;
      console.log(`   ✅ Reparado\n`);
    }
  }

  if (totalRepaired === 0) {
    console.log('✅ No se encontraron datos corruptos.');
  } else {
    console.log(`\n✅ ${totalRepaired} documento(s) reparado(s).`);
  }

  process.exit(0);
}

repair().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
