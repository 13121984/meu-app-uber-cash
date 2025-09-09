
"use server";

import { revalidatePath } from "next/cache";
import { isWithinInterval, startOfDay, endOfDay, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";
import type { ReportFilterValues } from "@/app/relatorios/actions";
import { getFile, saveFile } from './storage.service';


export interface Maintenance {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'preventive' | 'corrective' | 'both'; 
  kmAtService: number | null;
  reminderKm: number | null;
  reminderDate: Date | null;
}

const FILE_NAME = 'maintenance.json';


async function readMaintenanceData(userId: string): Promise<Maintenance[]> {
  if (!userId) return [];
  const data = await getFile<Maintenance[]>(userId, FILE_NAME, []);
  return (data || []).map(record => ({
    ...record,
    type: record.type || 'corrective', // Garante um valor padrão para registros antigos
    date: parseISO(record.date as any),
    reminderDate: record.reminderDate ? parseISO(record.reminderDate as any) : null,
    kmAtService: record.kmAtService ?? null,
    reminderKm: record.reminderKm ?? null,
  }));
}

async function writeMaintenanceData(userId: string, data: Maintenance[]): Promise<void> {
    if (!userId) return;
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveFile(userId, FILE_NAME, sortedData);
}


// --- Funções CRUD ---

export async function addMaintenance(userId: string, data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    const allRecords = await readMaintenanceData(userId);
    const newRecord: Maintenance = {
        ...data,
        id: Date.now().toString(),
        date: new Date(data.date),
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
    };
    allRecords.unshift(newRecord);
    await writeMaintenanceData(userId, allRecords);

    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true, id: newRecord.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao adicionar registro de manutenção.";
    return { success: false, error: errorMessage };
  }
}

export async function getMaintenanceRecords(userId: string): Promise<Maintenance[]> {
    if (!userId) return [];
    let records = await readMaintenanceData(userId);
    return records;
}

export async function getFilteredMaintenanceRecords(userId: string, filters?: ReportFilterValues): Promise<Maintenance[]> {
    if (!userId) return [];
    const allRecords = await getMaintenanceRecords(userId);
    
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


export async function updateMaintenance(userId: string, id: string, data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    const allRecords = await readMaintenanceData(userId);
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
    await writeMaintenanceData(userId, allRecords);
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar registro.";
    return { success: false, error: errorMessage };
  }
}


export async function deleteMaintenance(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    let allRecords = await readMaintenanceData(userId);
    const initialLength = allRecords.length;
    allRecords = allRecords.filter(r => r.id !== id);
    if(allRecords.length === initialLength){
        return { success: false, error: "Registro não encontrado."};
    }
    await writeMaintenanceData(userId, allRecords);
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}


export async function deleteAllMaintenance(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    await writeMaintenanceData(userId, []);
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    revalidatePath('/'); // For the new reminder card
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todos os registros.";
    return { success: false, error: errorMessage };
  }
}
