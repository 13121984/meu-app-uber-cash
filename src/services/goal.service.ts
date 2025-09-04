
"use server";

import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

const dataFilePath = path.join(process.cwd(), 'data', 'goals.json');

const defaultGoals: Goals = {
  daily: 200,
  weekly: 1000,
  monthly: 4000,
};

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(defaultGoals, null, 2), 'utf8');
  }
}

/**
 * Busca as metas do arquivo local.
 */
export async function getGoals(): Promise<Goals> {
  await ensureDataFile();
  const fileContent = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContent) as Goals;
}

/**
 * Salva ou atualiza as metas no arquivo local.
 */
export async function saveGoals(goals: Goals): Promise<{ success: boolean, error?: string }> {
  try {
    await ensureDataFile();
    await fs.writeFile(dataFilePath, JSON.stringify(goals, null, 2), 'utf8');
    
    revalidatePath('/dashboard');
    revalidatePath('/metas');

    return { success: true };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Falha ao salvar metas.";
    return { success: false, error: errorMessage };
  }
}
