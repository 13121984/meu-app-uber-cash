'use server';

import fs from 'fs/promises';
import { getFile, saveFile } from './storage.service';
import { getWorkDays, generateCsvContent } from '@/services/work-day.service';
import { format } from 'date-fns';


export interface BackupInput {
    userId: string;
}

export interface BackupOutput {
  success: boolean;
  message: string;
  backupDate?: string;
  fileName?: string;
  csvContent?: string;
}

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


export async function runBackupFlow({ userId }: BackupInput): Promise<BackupOutput> {
    const allWorkDays = await getWorkDays(userId);
    if (allWorkDays.length === 0) {
      return { success: false, message: "Nenhum dado para fazer backup." };
    }

    const csvContent = await generateCsvContent(allWorkDays);
    const now = new Date();
    const backupFileName = `Backup_UberCash_${format(now, 'yyyy-MM-dd_HH-mm')}.csv`;

    const saveResult = await saveBackupData(userId, {
      fileName: backupFileName,
      csvContent: csvContent,
    });

    if (!saveResult.success) {
      return { success: false, message: saveResult.error || "Falha ao salvar o arquivo de backup." };
    }
    
    return {
      success: true,
      message: `Backup criado com sucesso!`,
      backupDate: now.toISOString(),
      fileName: backupFileName,
      csvContent: csvContent,
    };
}


/**
 * Busca os metadados do último backup (sem o conteúdo CSV).
 */
export async function getBackupData(userId: string): Promise<Omit<BackupData, 'csvContent'>> {
  const data = await getFile<BackupData>(userId, FILE_NAME, defaultData);
  return {
    lastBackupDate: data.lastBackupDate,
    fileName: data.fileName,
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
