
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";
import { getCurrentUser } from "./user.service";

/**
 * Retorna a referência do documento de configurações para o usuário logado.
 */
const getSettingsDocRef = async () => {
    const user: any = await getCurrentUser();
    if (!user) {
        // Retorna uma referência "fantasma" para um usuário anônimo.
        // As operações de escrita falharão, e a leitura retornará o padrão.
        return doc(db, "users", "anonymous", "settings", "userSettings");
    }
    // Cria um caminho único para as configurações de cada usuário.
    return doc(db, "users", user.uid, "settings", "userSettings");
};


/**
 * Busca as configurações salvas no Firestore.
 * Se não existir, retorna as configurações padrão.
 */
export async function getSettings(): Promise<Settings> {
  const user: any = await getCurrentUser();
  // Se não houver usuário (ex: durante o build ou em rotas não protegidas),
  // retorna o tema padrão para evitar erros.
  if (!user) {
      return {
          theme: 'dark',
          weeklyBackup: false,
          backupEmail: '',
          maintenanceNotifications: true,
          defaultFuelType: 'Gasolina Aditivada',
      };
  }
  
  const settingsDocRef = await getSettingsDocRef();

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
    // Retorna o valor padrão se o documento não existir para o usuário
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
  const user: any = await getCurrentUser();
  if (!user) return { success: false, error: "Usuário não autenticado." };

  const settingsDocRef = await getSettingsDocRef();

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
