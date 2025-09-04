

"use server";

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, sub, eachDayOfInterval, format, parseISO, isToday } from 'date-fns';
import { PeriodData, EarningsByCategory, TripsByCategory } from "@/components/dashboard/dashboard-client";
import { getGoals, Goals } from './goal.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getMaintenanceRecords, Maintenance } from './maintenance.service';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id:number; type: string; paid: number; price: number };

export interface WorkDay {
  id: string; // ID is now mandatory
  date: Date;
  km: number;
  hours: number;
  earnings: Earning[];
  fuelEntries: FuelEntry[];
  maintenance: {
    description: string;
    amount: number;
  };
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
  diasTrabalhados: number;
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
let workDaysCache: WorkDay[] | null = null;

async function readWorkDays(force = false): Promise<WorkDay[]> {
  if (workDaysCache && !force) {
    return workDaysCache;
  }
  try {
    await fs.access(workDaysFilePath);
    const fileContent = await fs.readFile(workDaysFilePath, 'utf8');
    workDaysCache = (JSON.parse(fileContent) as any[]).map(day => ({
        ...day,
        date: new Date(day.date),
    }));
    return workDaysCache as WorkDay[];
  } catch (error) {
    // If file doesn't exist or is empty
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
    }
    throw error;
  }
}

async function writeWorkDays(data: WorkDay[]): Promise<void> {
    await fs.mkdir(path.dirname(workDaysFilePath), { recursive: true });
    await fs.writeFile(workDaysFilePath, JSON.stringify(data, null, 2), 'utf8');
    workDaysCache = null; // Invalidate cache
}


export async function addWorkDay(data: Omit<WorkDay, 'id'>) {
  try {
    const allWorkDays = await readWorkDays(true);
    const newWorkDay: WorkDay = {
        ...data,
        id: Date.now().toString(),
        date: new Date(data.date),
    };
    allWorkDays.unshift(newWorkDay);
    await writeWorkDays(allWorkDays);
    revalidatePath('/');
    revalidatePath('/gerenciamento');
    return { success: true, id: newWorkDay.id };
  } catch (e) {
    console.error("Error adding work day: ", e);
    const errorMessage = e instanceof Error ? e.message : "Failed to save work day.";
    return { success: false, error: errorMessage };
  }
}

export async function updateWorkDay(id: string, data: Omit<WorkDay, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const allWorkDays = await readWorkDays(true);
    const index = allWorkDays.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    allWorkDays[index] = { ...data, id, date: new Date(data.date) };
    await writeWorkDays(allWorkDays);
    
    return { success: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar registro.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteWorkDay(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allWorkDays = await readWorkDays(true);
    const initialLength = allWorkDays.length;
    allWorkDays = allWorkDays.filter(r => r.id !== id);
    if(allWorkDays.length === initialLength){
        return { success: false, error: "Registro não encontrado."};
    }
    await writeWorkDays(allWorkDays);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registro.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteAllWorkDays(): Promise<{ success: boolean; error?: string }> {
  try {
    await writeWorkDays([]); // Write an empty array
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todos os registros.";
    return { success: false, error: errorMessage };
  }
}


export async function getWorkDays(): Promise<WorkDay[]> {
    return await readWorkDays();
}

function calculatePeriodData(workDays: WorkDay[], period: 'diária' | 'semanal' | 'mensal', goals: Goals, maintenanceRecords: Maintenance[]): PeriodData {
    const earningsByCategoryMap = new Map<string, number>();
    const tripsByCategoryMap = new Map<string, number>();

    const data = {
        totalGanho: 0,
        totalLucro: 0,
        totalCombustivel: 0,
        totalExtras: 0,
        diasTrabalhados: workDays.length,
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
    });
    
    data.totalLucro -= maintenanceData.totalSpent;


    const earningsByCategory: EarningsByCategory[] = Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total }));
    const tripsByCategory: TripsByCategory[] = Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total }));

    let targetGoal = 0;
    if (period === 'diária') targetGoal = goals.daily;
    if (period === 'semanal') targetGoal = goals.weekly;
    if (period === 'mensal') targetGoal = goals.monthly;

    return {
        ...data,
        ganhoPorHora: data.totalHoras > 0 ? data.totalGanho / data.totalHoras : 0,
        ganhoPorKm: data.totalKm > 0 ? data.totalGanho / data.totalKm : 0,
        eficiencia: data.totalKm > 0 && data.totalLitros > 0 ? data.totalKm / data.totalLitros : 0,
        earningsByCategory,
        tripsByCategory,
        maintenance: maintenanceData,
        meta: { target: targetGoal, period: period },
    };
}


export async function getDashboardData() {
    const allWorkDays = await getWorkDays();
    const allMaintenance = await getMaintenanceRecords();
    const goals = await getGoals();
    const now = new Date();

    const todayDateString = now.toDateString();

    const todayWorkDays = allWorkDays.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate.toDateString() === todayDateString;
    });

    const thisWeekWorkDays = allWorkDays.filter(day => isWithinInterval(new Date(day.date), { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthWorkDays = allWorkDays.filter(day => isWithinInterval(new Date(day.date), { start: startOfMonth(now), end: endOfMonth(now) }));

    const todayMaintenance = allMaintenance.filter(m => new Date(m.date).toDateString() === todayDateString);

    const thisWeekMaintenance = allMaintenance.filter(m => isWithinInterval(new Date(m.date), { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthMaintenance = allMaintenance.filter(m => isWithinInterval(new Date(m.date), { start: startOfMonth(now), end: endOfMonth(now) }));

    const hoje = calculatePeriodData(todayWorkDays, "diária", goals, todayMaintenance);
    const semana = calculatePeriodData(thisWeekWorkDays, "semanal", goals, thisWeekMaintenance);
    const mes = calculatePeriodData(thisMonthWorkDays, "mensal", goals, thisMonthMaintenance);

    return { hoje, semana, mes };
}

export async function getReportData(allWorkDays: WorkDay[], filters: ReportFilterValues): Promise<ReportData> {
  const now = new Date();
  let filteredDays: WorkDay[] = [];
  let interval: { start: Date; end: Date } | null = null;

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
  
  const sourceDays = allWorkDays.length > 0 ? allWorkDays : await getWorkDays();
  if (interval) {
    filteredDays = sourceDays.filter(d => isWithinInterval(new Date(d.date), interval!));
  } else {
    filteredDays = sourceDays;
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
  
  const totalManutencaoFromWorkdays = filteredDays.reduce((sum, d) => sum + (d.maintenance?.amount || 0), 0);

  filteredDays.forEach(day => {
    const dailyEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const dailyFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const dailyTrips = day.earnings.reduce((sum, e) => sum + e.trips, 0);
    const dailyMaintenance = day.maintenance?.amount || 0;

    totalGanho += dailyEarnings;
    totalCombustivel += dailyFuel;
    totalKm += day.km;
    totalHoras += day.hours;
    totalViagens += dailyTrips;

    day.fuelEntries.forEach(fuel => {
        if(fuel.price > 0) totalLitros += fuel.paid / fuel.price;
        fuelExpensesMap.set(fuel.type, (fuelExpensesMap.get(fuel.type) || 0) + fuel.paid);
    });

    day.earnings.forEach(earning => {
        earningsByCategoryMap.set(earning.category, (earningsByCategoryMap.get(earning.category) || 0) + earning.amount);
        tripsByCategoryMap.set(earning.category, (tripsByCategoryMap.get(earning.category) || 0) + earning.trips);
    });

    const dateKey = format(new Date(day.date), 'yyyy-MM-dd');
    const currentDaily = dailyDataMap.get(dateKey) || { lucro: 0, viagens: 0 };
    currentDaily.lucro += dailyEarnings - dailyFuel - dailyMaintenance;
    currentDaily.viagens += dailyTrips;
    dailyDataMap.set(dateKey, currentDaily);
  });
  
  const profitEvolution: ProfitEvolutionData[] = [];
  const dailyTrips: DailyTripsData[] = [];
  if (interval) {
      eachDayOfInterval(interval).forEach(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const data = dailyDataMap.get(dateKey);
          profitEvolution.push({ date: format(date, 'dd/MM'), lucro: (data?.lucro ?? 0) });
          dailyTrips.push({ date: format(date, 'dd/MM'), viagens: data?.viagens ?? 0 });
      })
  } else if (dailyDataMap.size > 0) {
      [...dailyDataMap.entries()].sort().forEach(([dateKey, data]) => {
          profitEvolution.push({ date: format(parseISO(dateKey), 'dd/MM'), lucro: data.lucro });
          dailyTrips.push({ date: format(parseISO(dateKey), 'dd/MM'), viagens: data.viagens });
      })
  }
  
  const totalGastos = totalCombustivel + totalManutencaoFromWorkdays;
  const totalLucro = totalGanho - totalGastos; 
  const ganhoPorHora = totalHoras > 0 ? totalGanho / totalHoras : 0;
  const ganhoPorKm = totalKm > 0 ? totalGanho / totalKm : 0;
  const eficiencia = totalKm > 0 && totalLitros > 0 ? totalKm / totalLitros : 0;
  const earningsByCategory: EarningsByCategory[] = Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total }));
  const tripsByCategory: TripsByCategory[] = Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total }));
  const fuelExpenses: FuelExpense[] = Array.from(fuelExpensesMap, ([type, total]) => ({ type, total }));

  const profitComposition = [
    { name: 'Lucro Líquido', value: totalLucro, fill: 'hsl(var(--chart-1))', totalGanho },
    { name: 'Combustível', value: totalCombustivel, fill: 'hsl(var(--chart-5))', totalGanho },
    { name: 'Manutenção', value: totalManutencaoFromWorkdays, fill: 'hsl(var(--chart-3))', totalGanho },
  ].filter(item => item.value !== 0);
  
  return {
    totalGanho,
    totalLucro,
    totalGastos,
    diasTrabalhados: new Set(filteredDays.map(d => new Date(d.date).toDateString())).size,
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
