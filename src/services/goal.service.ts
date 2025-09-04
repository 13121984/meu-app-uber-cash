
"use server";

import { revalidatePath } from "next/cache";

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

// In-memory storage for goals
let memoryGoals: Goals = {
  daily: 200,
  weekly: 1000,
  monthly: 4000,
};

/**
 * Busca as metas da memória local.
 */
export async function getGoals(): Promise<Goals> {
  return Promise.resolve(memoryGoals);
}

/**
 * Salva ou atualiza as metas na memória local.
 */
export async function saveGoals(goals: Goals): Promise<{ success: boolean, error?: string }> {
  memoryGoals = goals;
  
  revalidatePath('/dashboard');
  revalidatePath('/metas');

  return Promise.resolve({ success: true });
}
