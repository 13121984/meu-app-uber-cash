
"use server";

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, format, parseISO, isSameDay, setYear, setMonth } from 'date-fns';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getFile, saveFile } from './storage.service';
import { revalidatePath } from 'next/cache';
import { updateAllSummaries } from './summary.service';

// --- Tipos e Interfaces ---

export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id:number; type: string; paid: number; price: number };
export type TimeEntry = { id: number; start: string; end:string; };
export interface WorkDay {
  id: string;
  date: Date;
  km: number;
  hours: number;
  timeEntries: TimeEntry[];
  earnings: Earning[];
  fuelEntries: FuelEntry[];
  maintenanceEntries: { id: number, description: string, amount: number }[];
}
export interface GroupedWorkDay {
  date: Date;
  totalProfit: number;
  totalHours: number;
  totalKm: number;
  entries: WorkDay[];
}
export interface ImportedWorkDay {
    date: string;
    km: string;
    hours: string;
    earnings_category: string;
    earnings_trips: string;
    earnings_amount: string;
    fuel_type: string;
    fuel_paid: string;
    fuel_price: string;
    maintenance_description: string;
    maintenance_amount: string;
}

const FILE_NAME = 'work-days.json';

// --- Funções de Leitura/Escrita ---

async function readWorkDays(userId: string): Promise<WorkDay[]> {
  if (!userId) return [];
  const data = await getFile<WorkDay[]>(userId, FILE_NAME, []);
  return (data || []).map(day => ({
      ...day,
      date: parseISO(day.date as any), // Datas são salvas como ISO strings
      maintenanceEntries: day.maintenanceEntries || [],
  }));
}

async function writeWorkDays(userId: string, data: WorkDay[]): Promise<void> {
    if (!userId) return;
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveFile(userId, FILE_NAME, sortedData);
}

const revalidateAll = () => {
    revalidatePath('/', 'layout');
};

// --- Funções CRUD ---

export async function addOrUpdateWorkDay(userId: string, data: WorkDay): Promise<{ success: boolean; id?: string; error?: string, operation: 'created' | 'updated' }> {
  if (!userId) return { success: false, error: "Usuário não autenticado.", operation: 'created' };
  try {
    const allWorkDays = await readWorkDays(userId);
    if (data.id && data.id !== 'today' && data.id !== 'other-day') {
      const existingDayIndex = allWorkDays.findIndex(d => d.id === data.id);
      if (existingDayIndex > -1) {
        allWorkDays[existingDayIndex] = { ...data, date: startOfDay(data.date) };
        await writeWorkDays(userId, allWorkDays);
        await updateAllSummaries(userId);
        return { success: true, id: data.id, operation: 'updated' };
      }
    }
    
    const newWorkDay: WorkDay = {
      ...data,
      id: Date.now().toString(),
      date: startOfDay(data.date),
    };
    allWorkDays.unshift(newWorkDay);
    await writeWorkDays(userId, allWorkDays);
    await updateAllSummaries(userId);
    return { success: true, id: newWorkDay.id, operation: 'created' };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to save work day.";
    return { success: false, error: errorMessage, operation: 'created' };
  }
}

export async function addMultipleWorkDays(userId: string, importedData: ImportedWorkDay[]) {
    if (!userId) return { success: false, error: "Usuário não fornecido para importação." };
    
    try {
        let allWorkDays = await readWorkDays(userId);
        const workDaysToUpsert: WorkDay[] = [];

        const groupedByDate = new Map<string, ImportedWorkDay[]>();
        for (const row of importedData) {
            if (!row.date) continue;
            const dateKey = row.date;
            if (!groupedByDate.has(dateKey)) {
                groupedByDate.set(dateKey, []);
            }
            groupedByDate.get(dateKey)!.push(row);
        }

        for (const [dateKey, rows] of groupedByDate.entries()) {
            const date = parseISO(dateKey);
            const firstRow = rows[0];
            const km = parseFloat(firstRow.km.replace(',', '.')) || 0;
            const hours = parseFloat(firstRow.hours?.toString().replace(',', '.') || 0);

            const earnings: Earning[] = [];
            const fuelEntries: FuelEntry[] = [];
            
            rows.forEach(row => {
                if (row.earnings_category && row.earnings_amount) {
                    earnings.push({
                        id: Date.now() + Math.random(),
                        category: row.earnings_category,
                        trips: parseInt(row.earnings_trips) || 0,
                        amount: parseFloat(row.earnings_amount.replace(',', '.')) || 0
                    });
                }
                if (row.fuel_type && row.fuel_paid) {
                    fuelEntries.push({
                        id: Date.now() + Math.random(),
                        type: row.fuel_type,
                        paid: parseFloat(row.fuel_paid.replace(',', '.')) || 0,
                        price: parseFloat(row.fuel_price.replace(',', '.')) || 0
                    });
                }
            });
            
            workDaysToUpsert.push({
                id: Date.now().toString() + dateKey,
                date: date,
                km: km,
                hours: hours,
                earnings,
                fuelEntries,
                maintenanceEntries: [],
                timeEntries: [],
            });
        }
        
        const datesToReplace = new Set(workDaysToUpsert.map(wd => format(wd.date, 'yyyy-MM-dd')));
        const filteredWorkDays = allWorkDays.filter(wd => !datesToReplace.has(format(wd.date, 'yyyy-MM-dd')));
        const finalWorkDays = [...filteredWorkDays, ...workDaysToUpsert];

        await writeWorkDays(userId, finalWorkDays);
        await updateAllSummaries(userId);
        return { success: true, count: workDaysToUpsert.length };

    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to import work days.";
        return { success: false, error: errorMessage };
    }
}

export async function deleteWorkDayEntry(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    let allWorkDays = await readWorkDays(userId);
    allWorkDays = allWorkDays.filter(r => r.id !== id);
    await writeWorkDays(userId, allWorkDays);
    await updateAllSummaries(userId);
    revalidateAll();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteWorkDaysByFilter(userId: string, filters: ReportFilterValues): Promise<{ success: boolean; error?: string, count?: number }> {
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    try {
        let allWorkDays = await readWorkDays(userId);
        const initialLength = allWorkDays.length;

        const workDaysToDelete = getFilteredWorkDays(allWorkDays, filters);
        
        const finalWorkDays = allWorkDays.filter(day => {
            return !workDaysToDelete.some(toDelete => toDelete.id === day.id);
        });

        const deletedCount = initialLength - finalWorkDays.length;
        await writeWorkDays(userId, finalWorkDays);
        await updateAllSummaries(userId);
        revalidateAll();
        return { success: true, count: deletedCount };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registros em massa.";
        return { success: false, error: errorMessage };
    }
}

// --- Funções de Gerenciamento de Dados ---

// Internal demo data, to avoid file system issues during build
const demoData: Omit<WorkDay, 'date'> & { date: string }[] = [
  { "id": "demo-1", "date": "2024-12-31", "km": 120.8, "hours": 10, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 19, "amount": 172 }, { "id": 2, "category": "Uber Cash", "trips": 4, "amount": 55.46 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 56.33, "price": 4.99 }, { "id": 2, "type": "Etanol", "paid": 50.9, "price": 5.09 } ], "maintenanceEntries": [] },
  { "id": "demo-2", "date": "2024-12-30", "km": 88, "hours": 6, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 16, "amount": 168.8 } ], "fuelEntries": [], "maintenanceEntries": [] },
  { "id": "demo-3", "date": "2024-12-28", "km": 119.5, "hours": 9, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 22, "amount": 222.44 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 38.57, "price": 4.99 } ], "maintenanceEntries": [] },
  { "id": "demo-4", "date": "2024-12-27", "km": 34, "hours": 3, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 6, "amount": 66.97 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 20.85, "price": 4.99 } ], "maintenanceEntries": [] },
  { "id": "demo-5", "date": "2024-12-21", "km": 136, "hours": 9, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 16, "amount": 234.49 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 71.25, "price": 4.99 } ], "maintenanceEntries": [] },
  { "id": "demo-6", "date": "2024-12-20", "km": 123.9, "hours": 9.5, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 24, "amount": 275.86 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 40.26, "price": 4.99 }, { "id": 2, "type": "Etanol", "paid": 50, "price": 5.09 } ], "maintenanceEntries": [] },
  { "id": "demo-7", "date": "2024-12-19", "km": 132.7, "hours": 9.5, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 25, "amount": 272.32 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 54.41, "price": 4.99 } ], "maintenanceEntries": [] },
  { "id": "demo-8", "date": "2024-12-18", "km": 147.8, "hours": 10, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 21, "amount": 284.54 }, { "id": 2, "category": "Ganhos Extras", "trips": 0, "amount": 7 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 40.26, "price": 5.09 } ], "maintenanceEntries": [] },
  { "id": "demo-9", "date": "2024-12-17", "km": 76, "hours": 5.92, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 15, "amount": 167.41 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 43.2, "price": 4.99 } ], "maintenanceEntries": [] },
  { "id": "demo-10", "date": "2024-12-15", "km": 112, "hours": 8, "timeEntries": [], "earnings": [ { "id": 1, "category": "Ganhos Extras", "trips": 0, "amount": 61 }, { "id": 2, "category": "99 Pop", "trips": 25, "amount": 274.6 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 71.73, "price": 4.99 }, { "id": 2, "type": "Etanol", "paid": 30, "price": 5.09 } ], "maintenanceEntries": [] },
  { "id": "demo-11", "date": "2024-12-12", "km": 94, "hours": 5.92, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 2, "amount": 13.99 }, { "id": 2, "category": "Particular", "trips": 2, "amount": 22 }, { "id": 3, "category": "Uber Cash", "trips": 8, "amount": 83.18 }, { "id": 4, "category": "Ganhos Extras", "trips": 0, "amount": 7 } ], "fuelEntries": [], "maintenanceEntries": [] },
  { "id": "demo-12", "date": "2024-12-11", "km": 100, "hours": 6, "timeEntries": [], "earnings": [ { "id": 1, "category": "99 Pop", "trips": 12, "amount": 88.79 }, { "id": 2, "category": "Uber Cash", "trips": 3, "amount": 61.63 } ], "fuelEntries": [ { "id": 1, "type": "GNV", "paid": 68.58, "price": 4.99 } ], "maintenanceEntries": [] }
];

export async function loadDemoData(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: "Nenhum usuário ativo para carregar dados." };

    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const adjustedDemoData = demoData.map(day => {
            const originalDate = parseISO(day.date);
            const newDate = setMonth(setYear(originalDate, currentYear), currentMonth);
            return {
                ...day,
                date: newDate.toISOString() 
            };
        });

        await writeWorkDays(userId, adjustedDemoData as unknown as WorkDay[]);
        await updateAllSummaries(userId);
        revalidateAll();
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load demo data.";
        return { success: false, error: errorMessage };
    }
}


export async function clearAllData(userId: string): Promise<{ success: boolean; error?: string }> {
     if (!userId) return { success: false, error: "Nenhum usuário especificado para limpar dados." };
     try {
        await writeWorkDays(userId, []);
        await updateAllSummaries(userId);
        revalidateAll();
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to clear data.";
        return { success: false, error: errorMessage };
    }
}

export async function clearAllDataForUser(userId: string): Promise<void> {
    if (!userId) return;
    try {
        await writeWorkDays(userId, []);
    } catch (error) {
        console.error(`Failed to clear data for new user ${userId}:`, error);
    }
}

// --- Funções de Leitura ---

export async function getWorkDays(userId: string): Promise<WorkDay[]> {
    if (!userId) return [];
    return await readWorkDays(userId);
}

export async function getWorkDaysForDate(userId: string, date: Date): Promise<WorkDay[]> {
    if (!userId) return [];
    const allWorkDays = await readWorkDays(userId);
    return allWorkDays.filter(day => isSameDay(day.date, date));
}

function getFilteredWorkDays(
  allWorkDays: WorkDay[],
  filters: ReportFilterValues,
) {
  if (allWorkDays.length === 0) return [];
  
  const now = new Date();
  let interval: { start: Date; end: Date } | null = null;
  switch (filters.type) {
    case 'all':
      return allWorkDays;
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
    return allWorkDays.filter(d => isWithinInterval(d.date, interval!));
  } 

  return [];
}

export async function getFilteredAndGroupedWorkDays(
  userId: string,
  filters: ReportFilterValues
): Promise<GroupedWorkDay[]> {
  if (!userId) return [];
  const allWorkDays = await readWorkDays(userId);
  const filtered = getFilteredWorkDays(allWorkDays, filters);
  const grouped = groupWorkDays(filtered);
  return grouped.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function groupWorkDays(workDays: WorkDay[]): GroupedWorkDay[] {
  const grouped = new Map<string, GroupedWorkDay>();

  workDays.forEach(day => {
    const dateKey = format(startOfDay(day.date), 'yyyy-MM-dd');
    
    let group = grouped.get(dateKey);
    if (!group) {
      group = {
        date: startOfDay(day.date),
        totalProfit: 0,
        totalHours: 0,
        totalKm: 0,
        entries: [],
      };
      grouped.set(dateKey, group);
    }
    
    const earnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const fuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const maintenance = day.maintenanceEntries?.reduce((sum, m) => sum + m.amount, 0) || 0;
    const profit = earnings - fuel - maintenance;

    group.totalProfit += profit;
    group.totalHours += day.hours;
    group.totalKm += day.km;
    group.entries.push(day);
  });

  return Array.from(grouped.values());
}
