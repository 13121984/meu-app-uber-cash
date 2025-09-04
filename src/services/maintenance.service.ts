
"use server";

import { revalidatePath } from "next/cache";

export interface Maintenance {
  id?: string;
  date: Date;
  description: string;
  amount: number;
}

// In-memory storage for maintenance records
let maintenanceRecords: Maintenance[] = [];
let nextId = 1;


// --- Funções CRUD ---

/**
 * Adiciona um novo registro de manutenção na memória.
 * Retorna o ID do novo documento.
 */
export async function addMaintenance(data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const newRecord: Maintenance = {
        ...data,
        id: (nextId++).toString(),
        date: new Date(data.date),
    };
    maintenanceRecords.unshift(newRecord); // Add to the beginning

    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true, id: newRecord.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao adicionar registro de manutenção.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Busca todos os registros de manutenção da memória.
 */
export async function getMaintenanceRecords(): Promise<Maintenance[]> {
    return Promise.resolve(maintenanceRecords);
}

/**
 * Atualiza um registro de manutenção existente na memória.
 */
export async function updateMaintenance(id: string, data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const index = maintenanceRecords.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    maintenanceRecords[index] = { ...data, id, date: new Date(data.date) };
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar registro.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apaga um registro de manutenção da memória.
 */
export async function deleteMaintenance(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const initialLength = maintenanceRecords.length;
    maintenanceRecords = maintenanceRecords.filter(r => r.id !== id);
    if(maintenanceRecords.length === initialLength){
        return { success: false, error: "Registro não encontrado."};
    }
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao apagar registro." };
  }
}

/**
 * Apaga todos os registros de manutenção da memória.
 */
export async function deleteAllMaintenance(): Promise<{ success: boolean; error?: string }> {
  try {
    maintenanceRecords = [];
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao apagar todos os registros." };
  }
}
