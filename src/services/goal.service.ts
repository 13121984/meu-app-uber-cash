
"use server";

import { revalidatePath } from "next/cache";
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
  const savedGoals = await getFile<Goals>(userId, FILE_NAME, defaultGoals);
  // Garante que o objeto retornado sempre terá todos os campos do default
  return { ...defaultGoals, ...savedGoals } as Goals;
}

/**
 * Salva ou atualiza as metas no arquivo local do usuário.
 */
export async function saveGoals(userId: string, goals: Goals): Promise<{ success: boolean, error?: string }> {
  try {
    await saveFile(userId, FILE_NAME, goals);
    
    // Revalida as páginas que dependem desses dados
    revalidatePath('/dashboard');
    revalidatePath('/metas');
    revalidatePath('/inicio');

    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar metas.";
    return { success: false, error: errorMessage };
  }
}
