import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvU8uKaivoZH_401zpXyM5-OOGgi5OGcw",
  authDomain: "torneos-tenis-jdm.firebaseapp.com",
  projectId: "torneos-tenis-jdm",
  storageBucket: "torneos-tenis-jdm.firebasestorage.app",
  messagingSenderId: "951550758841",
  appId: "1:951550758841:web:b4baab45dde503d0717068"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
