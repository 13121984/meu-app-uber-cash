import fs from 'fs/promises';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, format, parseISO, isSameDay, setYear, setMonth } from 'date-fns';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getFile, saveFile, getUserDataPath } from './storage.service';
import { getMaintenanceRecords, Maintenance } from './maintenance.service';
import { Goals, getGoals } from './goal.service';

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
const DEMO_DATA_FILE = 'demo-data.json';

// --- Funções de Leitura/Escrita Puras ---

async function readWorkDays(userId: string): Promise<WorkDay[]> {
  if (!userId) return [];
  const data = await getFile<WorkDay[]>(userId, FILE_NAME, []);
  return (data || []).map(day => ({
      ...day,
      date: parseISO(day.date as any),
      maintenanceEntries: day.maintenanceEntries || [],
      timeEntries: day.timeEntries || [],
  }));
}

async function writeWorkDays(userId: string, data: WorkDay[]): Promise<void> {
    if (!userId) return;
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveFile(userId, FILE_NAME, sortedData);
}

// --- Funções CRUD (ainda puras) ---

export async function addOrUpdateWorkDay(userId: string, data: WorkDay): Promise<{ success: boolean; id?: string; error?: string, operation: 'created' | 'updated' }> {
  try {
    const allWorkDays = await readWorkDays(userId);
    const finalDate = startOfDay(new Date(data.date));

    if (data.id && data.id !== 'today' && data.id !== 'other-day') {
      const existingDayIndex = allWorkDays.findIndex(d => d.id === data.id);
      if (existingDayIndex > -1) {
        allWorkDays[existingDayIndex] = { ...data, date: finalDate };
        await writeWorkDays(userId, allWorkDays);
        return { success: true, id: data.id, operation: 'updated' };
      }
    }
    
    const newWorkDay: WorkDay = { ...data, id: Date.now().toString(), date: finalDate };
    allWorkDays.unshift(newWorkDay);
    await writeWorkDays(userId, allWorkDays);
    return { success: true, id: newWorkDay.id, operation: 'created' };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save work day.", operation: 'created' };
  }
}

export async function deleteWorkDay(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allWorkDays = await readWorkDays(userId);
    allWorkDays = allWorkDays.filter(r => r.id !== id);
    await writeWorkDays(userId, allWorkDays);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao apagar registro." };
  }
}

export async function deleteWorkDaysByFilter(userId: string, filters: ReportFilterValues): Promise<{ success: boolean; error?: string, count?: number }> {
    try {
        let allWorkDays = await readWorkDays(userId);
        const initialLength = allWorkDays.length;
        const workDaysToDelete = getFilteredWorkDays(allWorkDays, filters);
        const finalWorkDays = allWorkDays.filter(day => !workDaysToDelete.some(toDelete => toDelete.id === day.id));
        const deletedCount = initialLength - finalWorkDays.length;
        await writeWorkDays(userId, finalWorkDays);
        return { success: true, count: deletedCount };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Falha ao apagar registros em massa." };
    }
}

// --- Funções de Leitura ---

export async function getWorkDays(userId: string): Promise<WorkDay[]> {
    if (!userId) return [];
    return await readWorkDays(userId);
}

export function getFilteredWorkDays(allWorkDays: WorkDay[], filters: ReportFilterValues): WorkDay[] {
  if (allWorkDays.length === 0) return [];
  
  const now = startOfDay(new Date());
  let interval: { start: Date; end: Date } | null = null;
  switch (filters.type) {
    case 'all': return allWorkDays;
    case 'today': interval = { start: now, end: endOfDay(now) }; break;
    case 'thisWeek': interval = { start: startOfWeek(now), end: endOfWeek(now) }; break;
    case 'thisMonth': interval = { start: startOfMonth(now), end: endOfMonth(now) }; break;
    case 'specificMonth':
      if (filters.year !== undefined && filters.month !== undefined) {
        const specificDate = new Date(filters.year, filters.month);
        interval = { start: startOfMonth(specificDate), end: endOfMonth(specificDate) };
      }
      break;
    case 'specificYear':
      if (filters.year !== undefined) {
        const specificDate = new Date(filters.year, 0);
        interval = { start: startOfYear(specificDate), end: endOfYear(specificDate) };
      }
      break;
    case 'custom':
      if (filters.dateRange?.from) {
        const fromDate = startOfDay(new Date(filters.dateRange.from));
        const toDate = filters.dateRange.to ? endOfDay(new Date(filters.dateRange.to)) : endOfDay(fromDate);
        interval = { start: fromDate, end: toDate };
      }
      break;
  }
  if (interval) return allWorkDays.filter(d => isWithinInterval(d.date, interval!));
  return [];
}

export function groupWorkDays(workDays: WorkDay[]): GroupedWorkDay[] {
  const grouped = new Map<string, GroupedWorkDay>();

  workDays.forEach(day => {
    const dateKey = format(startOfDay(day.date), 'yyyy-MM-dd');
    let group = grouped.get(dateKey);
    if (!group) {
      group = {
        date: startOfDay(day.date), totalProfit: 0, totalHours: 0, totalKm: 0, entries: [],
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

  return Array.from(grouped.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

// --- Funções de Exportação ---

const CSV_HEADERS = ['date', 'km', 'hours', 'earnings_category', 'earnings_trips', 'earnings_amount', 'fuel_type', 'fuel_paid', 'fuel_price', 'maintenance_description', 'maintenance_amount'];

function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return '';
    let stringValue = String(value);
    if (typeof value === 'number') stringValue = stringValue.replace('.', ',');
    if (/[",\r\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
    return stringValue;
}

export function generateCsvContent(workDays: WorkDay[]): string {
    const rows: string[][] = [];
    const sortedWorkDays = workDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedWorkDays.forEach(day => {
        const dateStr = format(new Date(day.date), 'yyyy-MM-dd');
        const maxEntries = Math.max(day.earnings.length, day.fuelEntries.length, day.maintenanceEntries.length, 1);
        for (let i = 0; i < maxEntries; i++) {
            const earning = day.earnings[i];
            const fuel = day.fuelEntries[i];
            const maintenance = day.maintenanceEntries[i];
            const isFirstRowOfDay = i === 0;
            rows.push([
                isFirstRowOfDay ? dateStr : '', isFirstRowOfDay ? escapeCsvValue(day.km) : '', isFirstRowOfDay ? escapeCsvValue(day.hours) : '',
                earning ? escapeCsvValue(earning.category) : '', earning ? escapeCsvValue(earning.trips) : '', earning ? escapeCsvValue(earning.amount) : '',
                fuel ? escapeCsvValue(fuel.type) : '', fuel ? escapeCsvValue(fuel.paid) : '', fuel ? escapeCsvValue(fuel.price) : '',
                maintenance ? escapeCsvValue(maintenance.description) : '', maintenance ? escapeCsvValue(maintenance.amount) : ''
            ]);
        }
    });

    return [CSV_HEADERS.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// --- Funções de Gerenciamento de Dados (ex: Demo) ---

async function getDemoData(): Promise<WorkDay[]> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'user-data', 'paulo-vitor-tiburcio', 'backup.json'); // Usando um backup como fonte
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const backupData = JSON.parse(fileContent);
        const csvContent = backupData.csvContent;
        const lines = csvContent.split('\n').slice(1);

        const workDaysMap = new Map<string, WorkDay>();

        lines.forEach(line => {
            const values = line.split(',');
            const date = values[0];
            if (!date) return;

            if (!workDaysMap.has(date)) {
                workDaysMap.set(date, {
                    id: `demo-${date}`, date: parseISO(date),
                    km: parseFloat(values[1]) || 0, hours: parseFloat(values[2]) || 0,
                    earnings: [], fuelEntries: [], maintenanceEntries: [], timeEntries: []
                });
            }

            const day = workDaysMap.get(date)!;
            if (values[3] && values[5]) { // earnings
                day.earnings.push({ id: Math.random(), category: values[3], trips: parseInt(values[4]) || 0, amount: parseFloat(values[5]) || 0 });
            }
            if (values[6] && values[7]) { // fuel
                day.fuelEntries.push({ id: Math.random(), type: values[6], paid: parseFloat(values[7]) || 0, price: parseFloat(values[8]) || 0 });
            }
        });
        return Array.from(workDaysMap.values());
    } catch {
        return []; // Retorna vazio se não conseguir ler os dados de demonstração
    }
}

export async function loadDemoData(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: "Nenhum usuário ativo para carregar dados." };
    try {
        const demoWorkDays = await getDemoData();
        await writeWorkDays(userId, demoWorkDays);
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to load demo data." };
    }
}

export async function clearAllDataForUser(userId: string): Promise<{ success: boolean; error?: string }> {
     if (!userId) return { success: false, error: "Nenhum usuário especificado para limpar dados." };
     try {
        await writeWorkDays(userId, []);
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to clear data." };
    }
}
