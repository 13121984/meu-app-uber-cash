
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


async function ensureFile(filePath: string, defaultContent: object): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
  }
}

/**
 * Busca os metadados do último backup (sem o conteúdo CSV).
 */
export async function getBackupData(): Promise<Omit<BackupData, 'csvContent'>> {
  await ensureFile(dataFilePath, { lastBackupDate: null, fileName: null, csvContent: null });
  const fileContent = await fs.readFile(dataFilePath, 'utf8');
  const data = JSON.parse(fileContent);
  // Retorna os dados sem o conteúdo CSV pesado
  return {
    lastBackupDate: data.lastBackupDate,
    fileName: data.fileName,
    csvContent: null, // Exclui o conteúdo
  };
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

/**
 * Busca o conteúdo completo do backup para download.
 */
export async function getBackupForDownload(): Promise<{ success: boolean; csvContent?: string; fileName?: string; error?: string; }> {
    try {
        await ensureFile(dataFilePath, { lastBackupDate: null, fileName: null, csvContent: null });
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        const data: BackupData = JSON.parse(fileContent);
        
        if (data.csvContent && data.fileName) {
            return { success: true, csvContent: data.csvContent, fileName: data.fileName };
        } else {
            return { success: false, error: 'Arquivo de backup não encontrado ou vazio.' };
        }
    } catch (e) {
        const error = e instanceof Error ? e.message : 'Falha ao ler o arquivo de backup.';
        return { success: false, error };
    }
}
