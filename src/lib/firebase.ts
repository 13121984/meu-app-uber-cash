import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "rota-certa-lkbvr",
  "appId": "1:824212803664:web:32ee7ae1c6c9f796e30155",
  "storageBucket": "rota-certa-lkbvr.firebasestorage.app",
  "apiKey": "AIzaSyAG6jM0NodJIF_eS2s2KIK1dvjqFhNdEiI",
  "authDomain": "rota-certa-lkbvr.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "824212803664"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
