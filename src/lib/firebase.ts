
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "app-pro-01-430113",
  "appId": "1:1072979261835:web:2533c39958184f4f57d81b",
  "storageBucket": "app-pro-01-430113.appspot.com",
  "apiKey": "AIzaSyDFf3N5A_A4eL6DqGCEiE-r0jBIlSvaGS4",
  "authDomain": "app-pro-01-430113.firebaseapp.com",
  "messagingSenderId": "1072979261835"
};

// Singleton pattern para inicialização do Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length) {
    app = getApp();
} else {
    app = initializeApp(firebaseConfig);
}

auth = getAuth(app);
db = getFirestore(app);


export { app, db, auth };
