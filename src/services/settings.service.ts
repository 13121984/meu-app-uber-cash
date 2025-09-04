
"use server";

import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";

// Default settings, stored in memory
const defaultSettings: Settings = {
    theme: 'dark',
    weeklyBackup: false,
    backupEmail: '',
    maintenanceNotifications: true,
    defaultFuelType: 'Gasolina Aditivada',
};

let memorySettings: Settings = { ...defaultSettings };


/**
 * Busca as configurações salvas na memória.
 */
export async function getSettings(): Promise<Settings> {
  return Promise.resolve(memorySettings);
}

/**
 * Salva ou atualiza as configurações na memória.
 */
export async function saveSettings(settings: Settings): Promise<{ success: boolean, error?: string }> {
  memorySettings = { ...memorySettings, ...settings };
  
  revalidatePath('/configuracoes');
  revalidatePath('/'); 

  return Promise.resolve({ success: true });
}
