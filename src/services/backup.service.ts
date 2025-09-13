
"use server";

import fs from 'fs/promises';
import { getFile, saveFile } from './storage.service';

export interface BackupData {
  lastBackupDate: string | null;
  fileName: string | null;
  csvContent: string | null;
}

const FILE_NAME = 'backup.json';

const defaultData: BackupData = {
    lastBackupDate: null,
    fileName: null,
    csvContent: null
};

/**
 * Busca os metadados do último backup (sem o conteúdo CSV).
 */
export async function getBackupData(userId: string): Promise<Omit<BackupData, 'csvContent'>> {
  const data = await getFile<BackupData>(userId, FILE_NAME, defaultData);
  return {
    lastBackupDate: data.lastBackupDate,
    fileName: data.fileName,
    csvContent: null,
  };
}

/**
 * Salva os dados de um novo backup, sobrescrevendo o anterior.
 */
export async function saveBackupData(userId: string, data: Omit<BackupData, 'lastBackupDate'>): Promise<{ success: boolean; error?: string }> {
  try {
    const backupData: BackupData = {
      ...data,
      lastBackupDate: new Date().toISOString(),
    };
    await saveFile(userId, FILE_NAME, backupData);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao salvar dados de backup.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Busca o conteúdo completo do backup para download.
 */
export async function getBackupForDownload(userId: string): Promise<{ success: boolean; csvContent?: string; fileName?: string; error?: string; }> {
    try {
        const data = await getFile<BackupData>(userId, FILE_NAME, defaultData);
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
