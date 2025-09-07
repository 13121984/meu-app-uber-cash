
"use server";

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, sub, eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns';
import { PeriodData, EarningsByCategory, TripsByCategory, PerformanceByShift } from "@/components/dashboard/dashboard-client";
import { getGoals, Goals } from './goal.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getMaintenanceRecords, Maintenance, addMaintenance } from './maintenance.service';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id:number; type: string; paid: number; price: number };

export type TimeEntry = {
    id: number;
    start: string;
    end:string;
}

export interface WorkDay {
  id: string; // ID is now mandatory
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

export interface FuelExpense {
    type: string;
    total: number;
}

export interface ProfitEvolutionData {
    date: string;
    lucro: number;
}

export interface DailyTripsData {
    date: string;
    viagens: number;
}

export interface ReportData {
  totalGanho: number;
  totalLucro: number;
  totalGastos: number;
  totalCombustivel: number;
  diasTrabalhados: number;
  mediaHorasPorDia: number;
  mediaKmPorDia: number;
  profitComposition: { name: string; value: number; fill: string; totalGanho: number; }[];
  earningsByCategory: EarningsByCategory[];
  tripsByCategory: TripsByCategory[];
  fuelExpenses: FuelExpense[];
  totalKm: number;
  totalHoras: number;
  totalViagens: number;
  ganhoPorHora: number;
  ganhoPorKm: number;
  eficiencia: number;
  profitEvolution: ProfitEvolutionData[];
  dailyTrips: DailyTripsData[];
  rawWorkDays: WorkDay[]; // Adicionado para exportação
}

const workDaysFilePath = path.join(process.cwd(), 'data', 'work-days.json');

async function readWorkDays(): Promise<WorkDay[]> {
  try {
    await fs.access(workDaysFilePath);
    const fileContent = await fs.readFile(workDaysFilePath, 'utf8');
    // Important: Re-hydrate dates using parseISO to handle timezone correctly
    return (JSON.parse(fileContent) as any[]).map(day => ({
        ...day,
        date: parseISO(day.date),
        // Certifica que maintenanceEntries existe, mesmo para dados antigos
        maintenanceEntries: day.maintenanceEntries || [],
    }));
  } catch (error) {
    // If file doesn't exist or is empty
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await writeWorkDays([]); // Create the file if it doesn't exist
        return [];
    }
    console.error("Failed to read work-days.json", error);
    return [];
  }
}

async function writeWorkDays(data: WorkDay[]): Promise<void> {
    await fs.mkdir(path.dirname(workDaysFilePath), { recursive: true });
    // Sort by date descending before writing
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await fs.writeFile(workDaysFilePath, JSON.stringify(sortedData, null, 2), 'utf8');
}


export async function addOrUpdateWorkDay(data: WorkDay): Promise<{ success: boolean; id?: string; error?: string, operation: 'created' | 'updated' }> {
  try {
    const allWorkDays = await readWorkDays();
    // Se um ID é fornecido, tentamos atualizar.
    if (data.id && data.id !== 'today' && data.id !== 'other-day') {
      const existingDayIndex = allWorkDays.findIndex(d => d.id === data.id);
      if (existingDayIndex > -1) {
        // Update existing entry
        allWorkDays[existingDayIndex] = { ...data, date: startOfDay(data.date) };
        await writeWorkDays(allWorkDays);
        revalidateAll();
        return { success: true, id: data.id, operation: 'updated' };
      }
    }
    
    // Se não há ID ou o ID não foi encontrado, criamos um novo registro.
    const newWorkDay: WorkDay = {
      ...data,
      id: Date.now().toString(), // Always generate a new unique ID
      date: startOfDay(data.date), // Normalize date
    };
    allWorkDays.unshift(newWorkDay); // Add as the newest entry
    await writeWorkDays(allWorkDays);
    revalidateAll();
    return { success: true, id: newWorkDay.id, operation: 'created' };

  } catch (e) {
    console.error("Error adding or updating work day: ", e);
    const errorMessage = e instanceof Error ? e.message : "Failed to save work day.";
    return { success: false, error: errorMessage, operation: 'created' }; // Assume created on failure
  }
}


export async function addMultipleWorkDays(importedData: ImportedWorkDay[]) {
    try {
        let allWorkDays = await readWorkDays();
        const workDaysToUpsert: WorkDay[] = [];

        // Group imported data by date
        const groupedByDate = new Map<string, ImportedWorkDay[]>();
        for (const row of importedData) {
            if (!row.date) continue; // Skip rows without a date
            const dateKey = row.date;
            if (!groupedByDate.has(dateKey)) {
                groupedByDate.set(dateKey, []);
            }
            groupedByDate.get(dateKey)!.push(row);
        }

        // Process each day's data
        for (const [dateKey, rows] of groupedByDate.entries()) {
            const date = parseISO(dateKey);
            const firstRow = rows[0];
            const km = parseFloat(firstRow.km.replace(',', '.')) || 0;
            const hours = parseFloat(firstRow.hours?.toString().replace(',', '.')) || 0;

            const earnings: Earning[] = [];
            const fuelEntries: FuelEntry[] = [];
            const maintenanceEntries: { id: number; description: string; amount: number }[] = [];

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
                 if (row.maintenance_description && row.maintenance_amount) {
                    addMaintenance({ 
                        date: date, 
                        description: row.maintenance_description,
                        amount: parseFloat(row.maintenance_amount.replace(',', '.')) || 0
                    });
                }
            });
            
            // Create a single WorkDay object for the date
            workDaysToUpsert.push({
                id: Date.now().toString() + dateKey,
                date: date,
                km: km,
                hours: hours,
                earnings,
                fuelEntries,
                maintenanceEntries: [], // Maintenance is handled separately now
                timeEntries: [],
            });
        }
        
        // Upsert logic: remove existing days that are being imported, then add new ones
        const datesToReplace = new Set(workDaysToUpsert.map(wd => format(wd.date, 'yyyy-MM-dd')));
        const filteredWorkDays = allWorkDays.filter(wd => !datesToReplace.has(format(wd.date, 'yyyy-MM-dd')));
        const finalWorkDays = [...filteredWorkDays, ...workDaysToUpsert];

        await writeWorkDays(finalWorkDays);
        
        revalidateAll();
        return { success: true, count: workDaysToUpsert.length };

    } catch(e) {
        console.error("Error adding multiple work days: ", e);
        const errorMessage = e instanceof Error ? e.message : "Failed to import work days.";
        return { success: false, error: errorMessage };
    }
}


export async function deleteWorkDayEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allWorkDays = await readWorkDays();
    const initialLength = allWorkDays.length;
    allWorkDays = allWorkDays.filter(r => r.id !== id);
    if(allWorkDays.length === initialLength){
        return { success: false, error: "Registro não encontrado."};
    }
    await writeWorkDays(allWorkDays);
    revalidateAll();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteWorkDaysByFilter(filters: { query?: string, from?: string, to?: string }): Promise<{ success: boolean; error?: string, count?: number }> {
    try {
        const allWorkDays = await readWorkDays();
        const initialLength = allWorkDays.length;

        const workDaysToKeep = allWorkDays.filter(day => {
            const dayDateString = format(day.date, 'yyyy-MM-dd');
            
            // Check date filter
            if (filters.from) {
                const fromDateString = filters.from;
                const toDateString = filters.to || filters.from;
                if (dayDateString < fromDateString || dayDateString > toDateString) {
                    return true; // Keep this day, it's outside the date range to be deleted
                }
            }
            
            // Check query filter
            if (filters.query) {
                const dateString = format(day.date, 'dd/MM/yyyy');
                const searchString = JSON.stringify(day).toLowerCase();
                const queryLower = filters.query.toLowerCase();
                if (!(dateString.includes(queryLower) || searchString.includes(queryLower))) {
                   return true; // Keep this day, it doesn't match the query to be deleted
                }
            }

            // If it matches all filters, it should be deleted, so we return false
            return false;
        });

        const deletedCount = initialLength - workDaysToKeep.length;
        
        await writeWorkDays(workDaysToKeep);
        revalidateAll();
        return { success: true, count: deletedCount };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registros em massa.";
        return { success: false, error: errorMessage };
    }
}

export async function deleteAllWorkDays(): Promise<{ success: boolean; error?: string }> {
  try {
    await writeWorkDays([]); // Write an empty array
    revalidateAll();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todos os registros.";
    return { success: false, error: errorMessage };
  }
}

const revalidateAll = () => {
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/gerenciamento');
    revalidatePath('/relatorios');
    revalidatePath('/manutencao');
    revalidatePath('/registrar', 'layout'); // Revalida a página de registro e subpáginas
    revalidatePath('/configuracoes');
}

export async function getWorkDays(): Promise<WorkDay[]> {
    return await readWorkDays();
}


export async function getWorkDaysForDate(date: Date): Promise<WorkDay[]> {
    const allWorkDays = await readWorkDays();
    return allWorkDays.filter(day => isSameDay(day.date, date));
}

export async function getFilteredWorkDays(
  filters: ReportFilterValues
): Promise<GroupedWorkDay[]> {
  const allWorkDays = await readWorkDays();
  let filteredEntries: WorkDay[] = [];

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
    // If no interval could be determined and it's not 'all', return empty.
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


const timeToMinutes = (time: string): number => {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const getShift = (startTime: string): PerformanceByShift['shift'] => {
    const startMinutes = timeToMinutes(startTime);
    if (startMinutes >= timeToMinutes("06:01") && startMinutes <= timeToMinutes("12:00")) return 'Manhã';
    if (startMinutes > timeToMinutes("12:00") && startMinutes <= timeToMinutes("18:00")) return 'Tarde';
    if (startMinutes > timeToMinutes("18:00") && startMinutes <= timeToMinutes("23:59")) return 'Noite';
    return 'Madrugada';
};

function calculatePeriodData(workDays: WorkDay[], period: 'diária' | 'semanal' | 'mensal', goals: Goals, maintenanceRecords: Maintenance[]): PeriodData {
    const earningsByCategoryMap = new Map<string, number>();
    const tripsByCategoryMap = new Map<string, number>();
    const shiftPerformanceMap = new Map<PerformanceByShift['shift'], { profit: number; hours: number }>();

    const data = {
        totalGanho: 0,
        totalLucro: 0,
        totalCombustivel: 0,
        totalExtras: 0,
        diasTrabalhados: new Set(workDays.map(d => d.date.toDateString())).size,
        totalKm: 0,
        totalHoras: 0,
        totalViagens: 0,
        totalLitros: 0,
    };

    const maintenanceData = {
        totalSpent: maintenanceRecords.reduce((sum, record) => sum + record.amount, 0),
        servicesPerformed: maintenanceRecords.length,
    };

    workDays.forEach(day => {
        const dailyEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
        const dailyFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        const dailyProfit = dailyEarnings - dailyFuel;

        data.totalGanho += dailyEarnings;
        data.totalCombustivel += dailyFuel;
        data.totalLucro += dailyProfit;
        data.totalKm += day.km;
        data.totalHoras += day.hours;
        
        day.fuelEntries.forEach(fuel => {
            if (fuel.price > 0) {
                data.totalLitros += fuel.paid / fuel.price;
            }
        });
        
        day.earnings.forEach(earning => {
            const currentTotal = earningsByCategoryMap.get(earning.category) || 0;
            earningsByCategoryMap.set(earning.category, currentTotal + earning.amount);
            
            const currentTrips = tripsByCategoryMap.get(earning.category) || 0;
            tripsByCategoryMap.set(earning.category, currentTrips + earning.trips);
            
            data.totalViagens += earning.trips;
        });

        // Shift performance calculation
        if (day.timeEntries && day.timeEntries.length > 0) {
            const totalDayHours = day.timeEntries.reduce((sum, entry) => {
                const startMinutes = timeToMinutes(entry.start);
                const endMinutes = timeToMinutes(entry.end);
                return sum + (endMinutes > startMinutes ? (endMinutes - startMinutes) / 60 : 0);
            }, 0);

            if (totalDayHours > 0) {
                 day.timeEntries.forEach(entry => {
                    const startMinutes = timeToMinutes(entry.start);
                    const endMinutes = timeToMinutes(entry.end);
                    const entryHours = endMinutes > startMinutes ? (endMinutes - startMinutes) / 60 : 0;
                    if (entryHours > 0) {
                        const shift = getShift(entry.start);
                        const shiftData = shiftPerformanceMap.get(shift) || { profit: 0, hours: 0 };
                        // Prorate the day's profit to the entry's duration
                        const entryProfit = dailyProfit * (entryHours / totalDayHours);
                        shiftData.profit += entryProfit;
                        shiftData.hours += entryHours;
                        shiftPerformanceMap.set(shift, shiftData);
                    }
                });
            }
        }
    });
    
    data.totalLucro -= maintenanceData.totalSpent;

    const earningsByCategory: EarningsByCategory[] = Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total }));
    const tripsByCategory: TripsByCategory[] = Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total }));
    const performanceByShift: PerformanceByShift[] = Array.from(shiftPerformanceMap, ([shift, data]) => ({
        shift,
        ...data,
        profitPerHour: data.hours > 0 ? data.profit / data.hours : 0
    })).sort((a,b) => a.shift.localeCompare(b.shift)); // Sort for consistent order

    const totalGanho = data.totalGanho;
    const totalLucroFinal = data.totalLucro;
    const totalCombustivelFinal = data.totalCombustivel;
    
    const profitComposition = [
        { name: 'Lucro Líquido', value: totalLucroFinal, fill: 'hsl(var(--chart-1))', totalGanho },
        { name: 'Combustível', value: totalCombustivelFinal, fill: 'hsl(var(--chart-2))', totalGanho },
        { name: 'Manutenção', value: maintenanceData.totalSpent, fill: 'hsl(var(--chart-3))', totalGanho },
      ].filter(item => item.value !== 0);


    let targetGoal = 0;
    if (period === 'diária') targetGoal = goals.daily;
    if (period === 'semanal') targetGoal = goals.weekly;
    if (period === 'mensal') targetGoal = goals.monthly;

    return {
        ...data,
        mediaHorasPorDia: data.diasTrabalhados > 0 ? data.totalHoras / data.diasTrabalhados : 0,
        mediaKmPorDia: data.diasTrabalhados > 0 ? data.totalKm / data.diasTrabalhados : 0,
        ganhoPorHora: data.totalHoras > 0 ? data.totalGanho / data.totalHoras : 0,
        ganhoPorKm: data.totalKm > 0 ? data.totalGanho / data.totalKm : 0,
        eficiencia: data.totalKm > 0 && data.totalLitros > 0 ? data.totalKm / data.totalLitros : 0,
        earningsByCategory,
        tripsByCategory,
        maintenance: maintenanceData,
        meta: { target: targetGoal, period: period },
        profitComposition: profitComposition,
        performanceByShift,
    };
}


export async function getDashboardData() {
    const allWorkDays = await getWorkDays();
    const allMaintenance = await getMaintenanceRecords();
    const goals = await getGoals();
    const now = new Date();

    const todayWorkDays = allWorkDays.filter(day => isSameDay(day.date, now));
    const thisWeekWorkDays = allWorkDays.filter(day => isWithinInterval(new Date(day.date), { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthWorkDays = allWorkDays.filter(day => isWithinInterval(new Date(day.date), { start: startOfMonth(now), end: endOfMonth(now) }));
    
    const todayMaintenance = allMaintenance.filter(m => isSameDay(m.date, now));
    const thisWeekMaintenance = allMaintenance.filter(m => isWithinInterval(new Date(m.date), { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthMaintenance = allMaintenance.filter(m => isWithinInterval(new Date(m.date), { start: startOfMonth(now), end: endOfMonth(now) }));

    const hoje = calculatePeriodData(todayWorkDays, "diária", goals, todayMaintenance);
    const semana = calculatePeriodData(thisWeekWorkDays, "semanal", goals, thisWeekMaintenance);
    const mes = calculatePeriodData(thisMonthWorkDays, "mensal", goals, thisMonthMaintenance);

    return { hoje, semana, mes };
}

// Nova função para buscar dados de um período específico sob demanda
export async function getPeriodData(period: 'hoje' | 'semana' | 'mes'): Promise<PeriodData> {
    const allWorkDays = await getWorkDays();
    const allMaintenance = await getMaintenanceRecords();
    const goals = await getGoals();
    const now = new Date();

    let workDaysForPeriod: WorkDay[] = [];
    let maintenanceForPeriod: Maintenance[] = [];
    let goalPeriod: 'diária' | 'semanal' | 'mensal' = 'diária';

    if (period === 'hoje') {
        workDaysForPeriod = allWorkDays.filter(day => isSameDay(day.date, now));
        maintenanceForPeriod = allMaintenance.filter(m => isSameDay(m.date, now));
        goalPeriod = 'diária';
    } else if (period === 'semana') {
        workDaysForPeriod = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfWeek(now), end: endOfWeek(now) }));
        maintenanceForPeriod = allMaintenance.filter(m => isWithinInterval(m.date, { start: startOfWeek(now), end: endOfWeek(now) }));
        goalPeriod = 'semanal';
    } else if (period === 'mes') {
        workDaysForPeriod = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfMonth(now), end: endOfMonth(now) }));
        maintenanceForPeriod = allMaintenance.filter(m => isWithinInterval(m.date, { start: startOfMonth(now), end: endOfMonth(now) }));
        goalPeriod = 'mensal';
    }
    
    return calculatePeriodData(workDaysForPeriod, goalPeriod, goals, maintenanceForPeriod);
}

export async function getTodayData(): Promise<PeriodData> {
    const allWorkDays = await getWorkDays();
    const allMaintenance = await getMaintenanceRecords();
    const goals = await getGoals();
    const now = new Date();
    
    const todayWorkDays = allWorkDays.filter(day => isSameDay(day.date, now));
    const todayMaintenance = allMaintenance.filter(m => isSameDay(m.date, now));

    return calculatePeriodData(todayWorkDays, "diária", goals, todayMaintenance);
}

export async function getReportData(filters: ReportFilterValues): Promise<ReportData> {
  const now = new Date();
  let filteredDays: WorkDay[] = [];
  let interval: { start: Date; end: Date } | null = null;
  const allWorkDays = await getWorkDays();

  switch (filters.type) {
    case 'all':
      if (allWorkDays.length > 0) {
        const dates = allWorkDays.map(d => new Date(d.date));
        interval = { start: new Date(Math.min(...dates.map(d => d.getTime()))), end: new Date(Math.max(...dates.map(d => d.getTime()))) };
      }
      filteredDays = allWorkDays;
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
    filteredDays = allWorkDays.filter(d => isWithinInterval(new Date(d.date), interval!));
  } else {
    filteredDays = []; // Default to empty if no interval matches
  }
  
  const allMaintenance = await getMaintenanceRecords();
  const filteredMaintenance = interval 
    ? allMaintenance.filter(m => isWithinInterval(new Date(m.date), interval!))
    : allMaintenance;

  const earningsByCategoryMap = new Map<string, number>();
  const tripsByCategoryMap = new Map<string, number>();
  const fuelExpensesMap = new Map<string, number>();
  const dailyDataMap = new Map<string, { lucro: number, viagens: number }>();

  let totalGanho = 0, totalCombustivel = 0, totalKm = 0, totalHoras = 0, totalViagens = 0, totalLitros = 0;
  const diasTrabalhados = new Set(filteredDays.map(d => d.date.toDateString())).size;
  
  // As despesas de manutenção agora são calculadas com base nos registros do serviço de manutenção
  const totalManutencaoFinal = filteredMaintenance.reduce((sum, m) => sum + m.amount, 0);


  filteredDays.forEach(day => {
    const dailyEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const dailyFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const dailyTrips = day.earnings.reduce((sum, e) => sum + e.trips, 0);
    const dailyProfit = dailyEarnings - dailyFuel;

    totalGanho += dailyEarnings;
    totalCombustivel += dailyFuel;
    totalKm += day.km;
    totalHoras += day.hours;
    totalViagens += dailyTrips;

    day.fuelEntries.forEach(fuel => {
        if(fuel.price > 0) totalLitros += fuel.paid / fuel.price;
        const type = fuel.type || 'Não especificado';
        fuelExpensesMap.set(type, (fuelExpensesMap.get(type) || 0) + fuel.paid);
    });

    day.earnings.forEach(earning => {
        earningsByCategoryMap.set(earning.category, (earningsByCategoryMap.get(earning.category) || 0) + earning.amount);
        tripsByCategoryMap.set(earning.category, (tripsByCategoryMap.get(earning.category) || 0) + earning.trips);
    });

    const dateKey = format(new Date(day.date), 'yyyy-MM-dd');
    const currentDaily = dailyDataMap.get(dateKey) || { lucro: 0, viagens: 0 };
    currentDaily.lucro += dailyProfit;
    currentDaily.viagens += dailyTrips;
    dailyDataMap.set(dateKey, currentDaily);
  });
  
  const totalLucro = totalGanho - totalCombustivel - totalManutencaoFinal;
  const totalGastos = totalCombustivel + totalManutencaoFinal;
  const ganhoPorHora = totalHoras > 0 ? totalGanho / totalHoras : 0;
  const ganhoPorKm = totalKm > 0 ? totalGanho / totalKm : 0;
  const eficiencia = totalKm > 0 && totalLitros > 0 ? totalKm / totalLitros : 0;
  const earningsByCategory: EarningsByCategory[] = Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total }));
  const tripsByCategory: TripsByCategory[] = Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total }));
  const fuelExpenses: FuelExpense[] = Array.from(fuelExpensesMap, ([type, total]) => ({ type, total }));

  const profitComposition = [
    { name: 'Lucro Líquido', value: totalLucro, fill: 'hsl(var(--chart-1))', totalGanho },
    { name: 'Combustível', value: totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho },
    { name: 'Manutenção', value: totalManutencaoFinal, fill: 'hsl(var(--chart-3))', totalGanho },
  ].filter(item => item.value > 0);
  
  const profitEvolution: ProfitEvolutionData[] = [];
  const dailyTrips: DailyTripsData[] = [];
  if (interval) {
      const daysInInterval = eachDayOfInterval(interval);
      const step = Math.ceil(daysInInterval.length / 31);
      for (let i = 0; i < daysInInterval.length; i += step) {
          const date = daysInInterval[i];
          const dateKey = format(date, 'yyyy-MM-dd');
          const data = dailyDataMap.get(dateKey);
          profitEvolution.push({ date: format(date, 'dd/MM'), lucro: (data?.lucro ?? 0) });
          dailyTrips.push({ date: format(date, 'dd/MM'), viagens: data?.viagens ?? 0 });
      }
  } else if (dailyDataMap.size > 0) {
      const sortedEntries = [...dailyDataMap.entries()].sort();
       const step = Math.ceil(sortedEntries.length / 31);
       for (let i = 0; i < sortedEntries.length; i+= step) {
           const [dateKey, data] = sortedEntries[i];
           profitEvolution.push({ date: format(parseISO(dateKey), 'dd/MM'), lucro: data.lucro });
           dailyTrips.push({ date: format(parseISO(dateKey), 'dd/MM'), viagens: data.viagens });
       }
  }
  
  return {
    totalGanho,
    totalLucro,
    totalGastos,
    totalCombustivel,
    diasTrabalhados,
    mediaHorasPorDia: diasTrabalhados > 0 ? totalHoras / diasTrabalhados : 0,
    mediaKmPorDia: diasTrabalhados > 0 ? totalKm / diasTrabalhados : 0,
    profitComposition,
    earningsByCategory,
    tripsByCategory,
    fuelExpenses,
    totalKm,
    totalHoras,
    totalViagens,
    ganhoPorHora,
    ganhoPorKm,
    eficiencia,
    profitEvolution,
    dailyTrips,
    rawWorkDays: filteredDays,
  };
}
