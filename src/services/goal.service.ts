
'use server';

import { getFile, saveFile } from './storage.service';

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
  workDaysPerWeek: number; // Novo campo
}

const FILE_NAME = 'goals.json';

const defaultGoals: Goals = {
  daily: 200,
  weekly: 1000,
  monthly: 4000,
  workDaysPerWeek: 6, // Valor padrão
};


/**
 * Busca as metas do arquivo local do usuário.
 */
export async function getGoals(userId: string): Promise<Goals> {
  if (!userId) {
    console.warn("getGoals called without userId, returning default goals.");
    return defaultGoals;
  }
  const savedGoals = await getFile<Goals>(userId, FILE_NAME, defaultGoals);
  // Garante que o objeto retornado sempre terá todos os campos do default
  return { ...defaultGoals, ...savedGoals };
}

/**
 * Salva ou atualiza as metas no arquivo local do usuário.
 */
export async function saveGoals(userId: string, goals: Goals): Promise<{ success: boolean, error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    await saveFile(userId, FILE_NAME, goals);
    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar metas.";
    return { success: false, error: errorMessage };
  }
}
