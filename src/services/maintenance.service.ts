
"use server";

import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';
import type { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";

export interface Maintenance {
  id: string; // ID is now mandatory
  date: Date;
  description: string;
  amount: number;
}

const dataFilePath = path.join(process.cwd(), 'data', 'maintenance.json');

async function readMaintenanceData(): Promise<Maintenance[]> {
  try {
    await fs.access(dataFilePath);
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    // Important: Re-hydrate dates, as they are stored as strings in JSON
    return (JSON.parse(fileContent) as any[]).map(record => ({
      ...record,
      date: new Date(record.date),
    }));
  } catch {
    // If the file doesn't exist, return an empty array
    return [];
  }
}

async function writeMaintenanceData(data: Maintenance[]): Promise<void> {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}


// --- Funções CRUD ---

/**
 * Adiciona um novo registro de manutenção no arquivo.
 * Retorna o ID do novo documento.
 */
export async function addMaintenance(data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const allRecords = await readMaintenanceData();
    const newRecord: Maintenance = {
        ...data,
        id: Date.now().toString(), // Simple unique ID
        date: new Date(data.date),
    };
    allRecords.unshift(newRecord); // Add to the beginning
    await writeMaintenanceData(allRecords);

    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true, id: newRecord.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao adicionar registro de manutenção.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Busca todos os registros de manutenção do arquivo, com filtros opcionais.
 */
export async function getMaintenanceRecords(filters?: { query?: string, dateRange?: DateRange }): Promise<Maintenance[]> {
    let records = await readMaintenanceData();

    if (filters) {
        records = records.filter(record => {
            // Filter by Date
            if (filters.dateRange?.from) {
                if (!isWithinInterval(record.date, { start: filters.dateRange.from, end: filters.dateRange.to || filters.dateRange.from })) {
                    return false;
                }
            }
            
            // Filter by Text Query
            if (filters.query) {
                const queryLower = filters.query.toLowerCase();
                if (!record.description.toLowerCase().includes(queryLower)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Atualiza um registro de manutenção existente no arquivo.
 */
export async function updateMaintenance(id: string, data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const allRecords = await readMaintenanceData();
    const index = allRecords.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    allRecords[index] = { ...data, id, date: new Date(data.date) };
    await writeMaintenanceData(allRecords);
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar registro.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apaga um registro de manutenção do arquivo.
 */
export async function deleteMaintenance(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allRecords = await readMaintenanceData();
    const initialLength = allRecords.length;
    allRecords = allRecords.filter(r => r.id !== id);
    if(allRecords.length === initialLength){
        return { success: false, error: "Registro não encontrado."};
    }
    await writeMaintenanceData(allRecords);
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apaga todos os registros de manutenção do arquivo.
 */
export async function deleteAllMaintenance(): Promise<{ success: boolean; error?: string }> {
  try {
    await writeMaintenanceData([]); // Write an empty array
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todos os registros.";
    return { success: false, error: errorMessage };
  }
}
