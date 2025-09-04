
"use client"; // Funções de login/signup são chamadas do cliente

import { 
    getAuth, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { app } from "@/lib/firebase";

// A instância 'auth' agora é importada diretamente de 'firebase.ts'
// para garantir que estamos usando a mesma instância em todo o aplicativo.
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    // Retorna a promessa do signInWithPopup para ser tratada no componente.
    return signInWithPopup(auth, googleProvider);
};

export const logout = () => {
    return signOut(auth);
};
