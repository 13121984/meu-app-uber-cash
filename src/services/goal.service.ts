
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

/**
 * Retorna a referência do documento de metas para o usuário anônimo.
 */
const getGoalsDocRef = () => {
  // Usamos um caminho fixo para o modo offline/sem login.
  return doc(db, "local", "user", "settings", "goals");
}


/**
 * Busca as metas salvas no Firestore local.
 * Se não existir, retorna metas zeradas.
 */
export async function getGoals(): Promise<Goals> {
  const settingsDocRef = getGoalsDocRef();

  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as Goals;
    }
    return { daily: 0, weekly: 0, monthly: 0 };
  } catch (error) {
    console.error("Error fetching goals: ", error);
    return { daily: 0, weekly: 0, monthly: 0 };
  }
}

/**
 * Salva ou atualiza as metas no Firestore local.
 */
export async function saveGoals(goals: Goals): Promise<{ success: boolean, error?: string }> {
  const settingsDocRef = getGoalsDocRef();

  try {
    await setDoc(settingsDocRef, goals, { merge: true });
    
    revalidatePath('/dashboard');
    revalidatePath('/metas');

    return { success: true };
  } catch (error) {
    console.error("Error saving goals: ", error);
    return { success: false, error: "Failed to save goals." };
  }
}
