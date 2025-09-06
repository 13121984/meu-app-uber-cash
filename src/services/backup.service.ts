
"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export interface BackupData {
  lastBackupDate: string | null;
  fileName: string | null;
  csvContent: string | null;
}

const dataFilePath = path.join(process.cwd(), 'data', 'backup.json');

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    const initialData: BackupData = { lastBackupDate: null, fileName: null, csvContent: null };
    await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

/**
 * Busca os dados do último backup.
 */
export async function getBackupData(): Promise<BackupData> {
  await ensureDataFile();
  const fileContent = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContent);
}

/**
 * Salva os dados de um novo backup, sobrescrevendo o anterior.
 */
export async function saveBackupData(data: Omit<BackupData, 'lastBackupDate'>): Promise<{ success: boolean; error?: string }> {
  try {
    const backupData: BackupData = {
      ...data,
      lastBackupDate: new Date().toISOString(),
    };
    await fs.writeFile(dataFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    revalidatePath('/configuracoes/backup');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao salvar dados de backup.";
    return { success: false, error: errorMessage };
  }
}
