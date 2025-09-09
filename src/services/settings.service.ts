
"use server";

import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";
import { getFile, saveFile } from './storage.service';
import { getCatalog } from './catalog.service';

// Default settings
const defaultSettings: Settings = {
    theme: 'dark',
    weeklyBackup: false, 
    backupEmail: '',
    maintenanceNotifications: true,
    defaultFuelType: 'Gasolina Aditivada',
};

const FILE_NAME = 'settings.json';

/**
 * Busca as configurações salvas no arquivo local do usuário.
 */
export async function getSettings(userId: string): Promise<Settings> {
  try {
    const savedSettings = await getFile<Settings>(userId, FILE_NAME, defaultSettings);

    // Validate that the defaultFuelType is still an active category
    const catalog = await getCatalog();
    const activeFuelTypes = catalog.fuel.filter(f => f.active).map(f => f.name);

    if (!activeFuelTypes.includes(savedSettings.defaultFuelType) && activeFuelTypes.length > 0) {
      savedSettings.defaultFuelType = activeFuelTypes[0]; // Reset to a valid active type
    } else if (activeFuelTypes.length === 0) {
      savedSettings.defaultFuelType = ''; // No active types
    }
    
    return { ...defaultSettings, ...savedSettings };
  } catch (error) {
    console.error("Error reading settings, returning defaults:", error);
    return defaultSettings;
  }
}

/**
 * Salva ou atualiza as configurações no arquivo local do usuário.
 */
export async function saveSettings(userId: string, settings: Settings): Promise<{ success: boolean, error?: string }> {
  try {
    const currentSettings = await getSettings(userId);
    const newSettings = { ...currentSettings, ...settings };
    await saveFile(userId, FILE_NAME, newSettings);
    
    // Revalidate paths that use these settings
    revalidatePath('/configuracoes');
    revalidatePath('/', 'layout'); // Revalidate layout to apply theme changes

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao salvar configurações.";
    return { success: false, error: errorMessage };
  }
}
