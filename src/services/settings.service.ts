"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";

const settingsDocRef = doc(db, "settings", "userSettings");

/**
 * Busca as configurações salvas no Firestore.
 * Se não existir, retorna as configurações padrão.
 */
export async function getSettings(): Promise<Settings> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as Settings;
    }
    // Retorna o valor padrão se o documento não existir
    return {
        theme: 'dark',
        textColor: 'white',
        weeklyBackup: false,
        backupEmail: '',
        maintenanceNotifications: true,
        defaultFuelType: 'Gasolina Aditivada',
    };
  } catch (error) {
    console.error("Error fetching settings: ", error);
    // Em caso de erro, retorna o padrão para não quebrar a aplicação.
    return {
        theme: 'dark',
        textColor: 'white',
        weeklyBackup: false,
        backupEmail: '',
        maintenanceNotifications: true,
        defaultFuelType: 'Gasolina Aditivada',
    };
  }
}

/**
 * Salva ou atualiza as configurações no Firestore.
 */
export async function saveSettings(settings: Settings): Promise<{ success: boolean, error?: string }> {
  try {
    // setDoc com merge:true cria o documento se não existir ou atualiza os campos se existir.
    await setDoc(settingsDocRef, settings, { merge: true });
    
    // Revalida o caminho para que o Next.js busque os dados atualizados.
    revalidatePath('/configuracoes');

    return { success: true };
  } catch (error) {
    console.error("Error saving settings: ", error);
    return { success: false, error: "Failed to save settings." };
  }
}
