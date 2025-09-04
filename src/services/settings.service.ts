
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";

/**
 * Retorna a referência do documento de configurações.
 */
const getSettingsDocRef = () => {
    return doc(db, "local", "user", "settings", "userSettings");
};


/**
 * Busca as configurações salvas no Firestore.
 * Se não existir, retorna as configurações padrão.
 */
export async function getSettings(): Promise<Settings> {
  const settingsDocRef = getSettingsDocRef();

  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        theme: data.theme || 'dark',
        weeklyBackup: data.weeklyBackup || false,
        backupEmail: data.backupEmail || '',
        maintenanceNotifications: data.maintenanceNotifications !== undefined ? data.maintenanceNotifications : true,
        defaultFuelType: data.defaultFuelType || 'Gasolina Aditivada',
      };
    }
    // Retorna o valor padrão se o documento não existir
    return {
        theme: 'dark',
        weeklyBackup: false,
        backupEmail: '',
        maintenanceNotifications: true,
        defaultFuelType: 'Gasolina Aditivada',
    };
  } catch (error) {
    console.error("Error fetching settings: ", error);
    return {
        theme: 'dark',
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
  const settingsDocRef = getSettingsDocRef();

  try {
    await setDoc(settingsDocRef, settings, { merge: true });
    
    revalidatePath('/configuracoes');
    revalidatePath('/'); 

    return { success: true };
  } catch (error) {
    console.error("Error saving settings: ", error);
    return { success: false, error: "Failed to save settings." };
  }
}
