import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0y044vQm639O4MayClz0wPlLzj8cE8dE",
  authDomain: "tennis-score-jdm-2026.firebaseapp.com",
  projectId: "tennis-score-jdm-2026",
  storageBucket: "tennis-score-jdm-2026.firebasestorage.app",
  messagingSenderId: "39917242",
  appId: "1:39917242:web:26b35331ea1e1bd18c1483"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
