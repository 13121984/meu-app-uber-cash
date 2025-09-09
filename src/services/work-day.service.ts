
"use server";

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, sub, eachDayOfInterval, format, parseISO, isSameDay, setYear, setMonth } from 'date-fns';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getFile, saveFile } from './storage.service';
import { revalidatePath } from 'next/cache';
import { updateAllSummaries } from './summary.service';
import demoData from '../../data/work-days.json';

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
  const data = await getFile<WorkDay[]>(userId, FILE_NAME, []);
  return (data || []).map(day => ({
      ...day,
      date: parseISO(day.date as any), // Datas são salvas como ISO strings
      maintenanceEntries: day.maintenanceEntries || [],
  }));
}

async function writeWorkDays(userId: string, data: WorkDay[]): Promise<void> {
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveFile(userId, FILE_NAME, sortedData);
}

const revalidateAll = (userId: string) => {
    revalidatePath('/', 'layout');
};

// --- Funções CRUD ---

export async function addOrUpdateWorkDay(userId: string, data: WorkDay): Promise<{ success: boolean; id?: string; error?: string, operation: 'created' | 'updated' }> {
  try {
    const allWorkDays = await readWorkDays(userId);
    if (data.id && data.id !== 'today' && data.id !== 'other-day') {
      const existingDayIndex = allWorkDays.findIndex(d => d.id === data.id);
      if (existingDayIndex > -1) {
        allWorkDays[existingDayIndex] = { ...data, date: startOfDay(data.date) };
        await writeWorkDays(userId, allWorkDays);
        await updateAllSummaries(userId);
        revalidateAll(userId);
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
    revalidateAll(userId);
    return { success: true, id: newWorkDay.id, operation: 'created' };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to save work day.";
    return { success: false, error: errorMessage, operation: 'created' };
  }
}

export async function addMultipleWorkDays(userId: string, importedData: ImportedWorkDay[]) {
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
        revalidateAll(userId);
        return { success: true, count: workDaysToUpsert.length };

    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to import work days.";
        return { success: false, error: errorMessage };
    }
}

export async function deleteWorkDayEntry(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allWorkDays = await readWorkDays(userId);
    allWorkDays = allWorkDays.filter(r => r.id !== id);
    await writeWorkDays(userId, allWorkDays);
    await updateAllSummaries(userId);
    revalidateAll(userId);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteWorkDaysByFilter(userId: string, filters: { query?: string, from?: string, to?: string }): Promise<{ success: boolean; error?: string, count?: number }> {
    try {
        const allWorkDays = await readWorkDays(userId);
        const initialLength = allWorkDays.length;

        const workDaysToKeep = allWorkDays.filter(day => {
            const dayDateString = format(day.date, 'yyyy-MM-dd');
            if (filters.from) {
                const fromDateString = filters.from;
                const toDateString = filters.to || filters.from;
                if (dayDateString < fromDateString || dayDateString > toDateString) {
                    return true;
                }
            }
            if (filters.query) {
                const dateString = format(day.date, 'dd/MM/yyyy');
                const searchString = JSON.stringify(day).toLowerCase();
                const queryLower = filters.query.toLowerCase();
                if (!(dateString.includes(queryLower) || searchString.includes(queryLower))) {
                   return true;
                }
            }
            return false;
        });
        const deletedCount = initialLength - workDaysToKeep.length;
        await writeWorkDays(userId, workDaysToKeep);
        await updateAllSummaries(userId);
        revalidateAll(userId);
        return { success: true, count: deletedCount };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registros em massa.";
        return { success: false, error: errorMessage };
    }
}

// --- Funções de Gerenciamento de Dados ---

export async function loadDemoData(userId: string): Promise<{ success: boolean; error?: string }> {
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
        revalidateAll(userId);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load demo data.";
        return { success: false, error: errorMessage };
    }
}

export async function clearAllDataForUser(userId: string): Promise<{ success: boolean; error?: string }> {
     try {
        await writeWorkDays(userId, []);
        await updateAllSummaries(userId);
        revalidateAll(userId);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to clear data.";
        return { success: false, error: errorMessage };
    }
}

// --- Funções de Leitura ---

export async function getWorkDays(userId: string): Promise<WorkDay[]> {
    return await readWorkDays(userId);
}

export async function getWorkDaysForDate(userId: string, date: Date): Promise<WorkDay[]> {
    const allWorkDays = await readWorkDays(userId);
    return allWorkDays.filter(day => isSameDay(day.date, date));
}

export async function getFilteredWorkDays(
  userId: string,
  filters: ReportFilterValues
): Promise<GroupedWorkDay[]> {
  const allWorkDays = await readWorkDays(userId);
  let filteredEntries: WorkDay[] = [];

  if (allWorkDays.length === 0) return [];

  const now = new Date();
  let interval: { start: Date; end: Date } | null = null;
  switch (filters.type) {
    case 'all':
      filteredEntries = allWorkDays;
      break;
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
    filteredEntries = allWorkDays.filter(d => isWithinInterval(d.date, interval!));
  } else if(filters.type !== 'all') {
    return [];
  }

  return groupWorkDays(filteredEntries).sort((a, b) => b.date.getTime() - a.date.getTime());
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
