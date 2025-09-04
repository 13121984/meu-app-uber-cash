
"use server";

import { revalidatePath } from "next/cache";
import type { Settings } from "@/types/settings";
import fs from 'fs/promises';
import path from 'path';

// Default settings
const defaultSettings: Settings = {
    theme: 'dark',
    weeklyBackup: false,
    backupEmail: '',
    maintenanceNotifications: true,
    defaultFuelType: 'Gasolina Aditivada',
};

const dataFilePath = path.join(process.cwd(), 'data', 'settings.json');

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
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
    return { ...defaultSettings, ...JSON.parse(fileContent) };
  } catch (error) {
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
    
    revalidatePath('/configuracoes');
    revalidatePath('/'); 

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao salvar configurações.";
    return { success: false, error: errorMessage };
  }
}
