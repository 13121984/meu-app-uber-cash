
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

// Usamos um documento fixo para armazenar as configurações de metas.
const settingsDocRef = doc(db, "settings", "goals");

/**
 * Busca as metas salvas no Firestore.
 * Se não existir, retorna metas zeradas.
 */
export async function getGoals(): Promise<Goals> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      // O 'as' é seguro aqui porque confiamos na estrutura que salvamos.
      return docSnap.data() as Goals;
    }
    // Retorna o valor padrão se o documento não existir
    return { daily: 0, weekly: 0, monthly: 0 };
  } catch (error) {
    console.error("Error fetching goals: ", error);
    // Em caso de erro, retorna o padrão para não quebrar a aplicação.
    return { daily: 0, weekly: 0, monthly: 0 };
  }
}

/**
 * Salva ou atualiza as metas no Firestore.
 */
export async function saveGoals(goals: Goals): Promise<{ success: boolean, error?: string }> {
  try {
    // setDoc com merge:true cria o documento se não existir ou atualiza os campos se existir.
    await setDoc(settingsDocRef, goals, { merge: true });
    
    // Revalida os caminhos que dependem desses dados para que o Next.js busque os dados atualizados.
    revalidatePath('/dashboard');
    revalidatePath('/metas');

    return { success: true };
  } catch (error) {
    console.error("Error saving goals: ", error);
    return { success: false, error: "Failed to save goals." };
  }
}
