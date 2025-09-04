
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAG6jM0NodJIF_eS2s2KIK1dvjqFhNdEiI",
  authDomain: "rota-certa-lkbvr.firebaseapp.com",
  projectId: "rota-certa-lkbvr",
  storageBucket: "rota-certa-lkbvr.appspot.com",
  messagingSenderId: "824212803664",
  appId: "1:824212803664:web:32ee7ae1c6c9f796e30155"
};


// Singleton pattern para inicialização do Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { app, db, auth };
