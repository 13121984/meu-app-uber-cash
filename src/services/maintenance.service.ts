
"use server";

import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';
import { isWithinInterval, startOfDay, endOfDay, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import type { ReportFilterValues } from "@/app/relatorios/actions";


export interface Maintenance {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'preventive' | 'corrective' | 'both'; // Novo campo
  kmAtService: number | null;
  reminderKm: number | null;
  reminderDate: Date | null;
}

const dataFilePath = path.join(process.cwd(), 'data', 'maintenance.json');

async function readMaintenanceData(): Promise<Maintenance[]> {
  try {
    await fs.access(dataFilePath);
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    return (JSON.parse(fileContent) as any[]).map(record => ({
      ...record,
      type: record.type || 'corrective', // Garante um valor padrão para registros antigos
      date: new Date(record.date),
      reminderDate: record.reminderDate ? new Date(record.reminderDate) : null,
      kmAtService: record.kmAtService ?? null,
      reminderKm: record.reminderKm ?? null,
    }));
  } catch {
    await writeMaintenanceData([]);
    return [];
  }
}

async function writeMaintenanceData(data: Maintenance[]): Promise<void> {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}


// --- Funções CRUD ---

export async function addMaintenance(data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const allRecords = await readMaintenanceData();
    const newRecord: Maintenance = {
        ...data,
        id: Date.now().toString(),
        date: new Date(data.date),
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
    };
    allRecords.unshift(newRecord);
    await writeMaintenanceData(allRecords);

    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true, id: newRecord.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao adicionar registro de manutenção.";
    return { success: false, error: errorMessage };
  }
}

export async function getMaintenanceRecords(): Promise<Maintenance[]> {
    let records = await readMaintenanceData();
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getFilteredMaintenanceRecords(filters?: ReportFilterValues): Promise<Maintenance[]> {
    const allRecords = await getMaintenanceRecords();
    
    if (!filters || !filters.type) {
        return allRecords;
    }
    
    let interval: { start: Date; end: Date } | null = null;
    const now = new Date();

    switch (filters.type) {
        case 'all':
          return allRecords;
        case 'today':
            interval = { start: startOfDay(now), end: endOfDay(now) };
            break;
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

    return allRecords;
}


export async function updateMaintenance(id: string, data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const allRecords = await readMaintenanceData();
    const index = allRecords.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    allRecords[index] = { 
        ...data, 
        id, 
        date: new Date(data.date),
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
    };
    await writeMaintenanceData(allRecords);
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar registro.";
    return { success: false, error: errorMessage };
  }
}


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
    revalidatePath('/'); // For the new reminder card
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}


export async function deleteAllMaintenance(): Promise<{ success: boolean; error?: string }> {
  try {
    await writeMaintenanceData([]);
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todos os registros.";
    return { success: false, error: errorMessage };
  }
}
