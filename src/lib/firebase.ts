
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "uber-cash-360",
  "appId": "1:621989417934:web:e41f17e3f202a0a256914a",
  "storageBucket": "uber-cash-360.appspot.com",
  "apiKey": "AIzaSyBlE9gAFJbCW_L4P_e3grnleAIyACp4Mhc",
  "authDomain": "uber-cash-360.firebaseapp.com",
  "messagingSenderId": "621989417934"
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
