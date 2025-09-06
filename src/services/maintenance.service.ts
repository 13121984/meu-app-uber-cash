
"use server";

import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';
import { isWithinInterval, startOfDay, endOfDay, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import type { ReportFilterValues } from "@/app/relatorios/actions";


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
export async function getMaintenanceRecords(): Promise<Maintenance[]> {
    let records = await readMaintenanceData();
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getFilteredMaintenanceRecords(filters?: ReportFilterValues): Promise<Maintenance[]> {
    const allRecords = await getMaintenanceRecords();
    
    // Por padrão (sem filtro), mostra apenas os de hoje
    if (!filters || !filters.type || filters.type === 'today') {
        const today = new Date();
        return allRecords.filter(record => isSameDay(record.date, today));
    }
    
    let interval: { start: Date; end: Date } | null = null;
    const now = new Date();

    switch (filters.type) {
        case 'all':
          return allRecords;
        case 'thisWeek':
          interval = { start: startOfWeek(now), end: endOfWeek(now) };
          break;
        case 'thisMonth':
          interval = { start: startOfMonth(now), end: endOfMonth(now) };
          break;
        case 'specificMonth':
          if (filters.year !== undefined && filters.month !== undefined) {
            interval = { start: startOfMonth(new Date(filters.year, filters.month)), end: endOfMonth(new Date(filters.year, filters.month)) };
          }
          break;
        case 'specificYear':
          if (filters.year !== undefined) {
            interval = { start: startOfYear(new Date(filters.year, 0)), end: endOfYear(new Date(filters.year, 0)) };
          }
          break;
        case 'custom':
          if (filters.dateRange?.from) {
            interval = { start: startOfDay(filters.dateRange.from), end: filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(filters.dateRange.from) };
          }
          break;
    }
    
    if (interval) {
        return allRecords.filter(record => isWithinInterval(record.date, interval!));
    }

    // Fallback para os registros de hoje se algo der errado
    return allRecords.filter(record => isSameDay(record.date, new Date()));
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
