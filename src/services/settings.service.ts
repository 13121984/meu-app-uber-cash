
"use server";

import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";
import fs from 'fs/promises';
import path from 'path';
import { getCatalog } from './catalog.service';

// Default settings
const defaultSettings: Settings = {
    theme: 'dark',
    weeklyBackup: false, // This field is now conceptually deprecated but kept for data integrity
    backupEmail: '', // This field is now conceptually deprecated but kept for data integrity
    maintenanceNotifications: true,
    defaultFuelType: 'Gasolina Aditivada',
};

const dataFilePath = path.join(process.cwd(), 'data', 'settings.json');

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    // If the file doesn't exist, create it with default values
    const catalog = await getCatalog();
    const activeFuelTypes = catalog.fuel.filter(f => f.active).map(f => f.name);
    // Set a sensible default if the default 'Gasolina Aditivada' isn't active or present
    if (!activeFuelTypes.includes(defaultSettings.defaultFuelType) && activeFuelTypes.length > 0) {
        defaultSettings.defaultFuelType = activeFuelTypes[0];
    }
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(defaultSettings, null, 2), 'utf8');
  }
}

/**
 * Busca as configurações salvas no arquivo local.
 */
export async function getSettings(): Promise<Settings> {
  await ensureDataFile();
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    const savedSettings = JSON.parse(fileContent);

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
 * Salva ou atualiza as configurações no arquivo local.
 */
export async function saveSettings(settings: Settings): Promise<{ success: boolean, error?: string }> {
  try {
    await ensureDataFile();
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await fs.writeFile(dataFilePath, JSON.stringify(newSettings, null, 2), 'utf8');
    
    // Revalidate paths that use these settings
    revalidatePath('/configuracoes');
    revalidatePath('/', 'layout'); // Revalidate layout to apply theme changes

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao salvar configurações.";
    return { success: false, error: errorMessage };
  }
}
