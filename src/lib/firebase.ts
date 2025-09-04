import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

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
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

db = getFirestore(app);
auth = getAuth(app);


export { app, db, auth };
