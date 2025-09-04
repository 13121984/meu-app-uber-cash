
"use server";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Retorna o usuário autenticado atualmente no lado do servidor.
 * É seguro usar em Server Components e Server Actions.
 */
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Para de ouvir após obter o primeiro resultado
            resolve(user);
        }, reject);
    });
};
