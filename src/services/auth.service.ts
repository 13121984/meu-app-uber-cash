
"use client"; // Funções de login/signup são chamadas do cliente

import { 
    getAuth, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { app } from "@/lib/firebase";

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

export const logout = () => {
    return signOut(auth);
};
