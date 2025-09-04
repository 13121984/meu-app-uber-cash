
"use client"; // Funções de login/signup são chamadas do cliente

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut
} from "firebase/auth";
import { app } from "@/lib/firebase";

export const auth = getAuth(app);

export const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    return signOut(auth);
};
