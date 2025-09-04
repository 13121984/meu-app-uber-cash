
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.service";

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

/**
 * Retorna a referência do documento de metas para o usuário logado.
 */
const getGoalsDocRef = async () => {
  const user: any = await getCurrentUser();
  if (!user) {
    // Retorna uma referência "fantasma" se o usuário não estiver logado.
    // As operações falharão, o que é o comportamento desejado.
    return doc(db, "users", "anonymous", "settings", "goals");
  }
  // Usamos um caminho que inclui o UID do usuário para isolar os dados.
  return doc(db, "users", user.uid, "settings", "goals");
}


/**
 * Busca as metas salvas no Firestore para o usuário logado.
 * Se não existir, retorna metas zeradas.
 */
export async function getGoals(): Promise<Goals> {
  const user: any = await getCurrentUser();
  if (!user) return { daily: 0, weekly: 0, monthly: 0 };

  const settingsDocRef = await getGoalsDocRef();

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
 * Salva ou atualiza as metas no Firestore para o usuário logado.
 */
export async function saveGoals(goals: Goals): Promise<{ success: boolean, error?: string }> {
  const user: any = await getCurrentUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };

  const settingsDocRef = await getGoalsDocRef();

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
