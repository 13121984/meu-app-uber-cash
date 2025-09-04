
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "app-pro-01-430113",
  "appId": "1:1072979261835:web:8c518b769f3ab15357d81b",
  "storageBucket": "app-pro-01-430113.appspot.com",
  "apiKey": "AIzaSyCge_L02hYgD40x-S2d2c12lIqZDmzLdDA",
  "authDomain": "app-pro-01-430113.firebaseapp.com",
  "messagingSenderId": "1072979261835"
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
