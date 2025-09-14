
'use server';

import type { Settings } from "@/types/settings";
import { getFile, saveFile } from './storage.service';
import { getCatalogData } from './catalog.service';

const defaultSettings: Settings = {
    theme: 'dark',
    weeklyBackup: false, 
    backupEmail: '',
    maintenanceNotifications: true,
    defaultFuelType: 'Gasolina Aditivada',
};

const FILE_NAME = 'settings.json';

export async function getSettings(userId: string): Promise<Settings> {
  if (!userId) return defaultSettings;
  try {
    const savedSettings = await getFile<Settings>(userId, FILE_NAME, defaultSettings);
    const catalog = await getCatalogData();
    const activeFuelTypes = catalog.fuel.filter(f => f.active).map(f => f.name);

    if (!activeFuelTypes.includes(savedSettings.defaultFuelType) && activeFuelTypes.length > 0) {
      savedSettings.defaultFuelType = activeFuelTypes[0];
    } else if (activeFuelTypes.length === 0) {
      savedSettings.defaultFuelType = '';
    }
    
    return { ...defaultSettings, ...savedSettings };
  } catch (error) {
    return defaultSettings;
  }
}

export async function saveSettings(userId: string, settings: Settings): Promise<{ success: boolean, error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    const currentSettings = await getSettings(userId);
    const newSettings = { ...currentSettings, ...settings };
    await saveFile(userId, FILE_NAME, newSettings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao salvar configurações." };
  }
}
