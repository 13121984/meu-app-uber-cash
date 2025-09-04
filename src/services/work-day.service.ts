

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
    // Important: Re-hydrate dates, as they are stored as strings in JSON
    return (JSON.parse(fileContent) as any[]).map(day => ({
        ...day,
        date: new Date(day.date),
    }));
  } catch (error) {
    // If file doesn't exist or is empty
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await writeWorkDays([]); // Create the file if it doesn't exist
        return [];
    }
    throw error;
  }
}

async function writeWorkDays(data: WorkDay[]): Promise<void> {
    await fs.mkdir(path.dirname(workDaysFilePath), { recursive: true });
    // Sort by date descending before writing
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await fs.writeFile(workDaysFilePath, JSON.stringify(sortedData, null, 2), 'utf8');
}


export async function addWorkDay(data: Omit<WorkDay, 'id'>) {
  try {
    const allWorkDays = await readWorkDays();
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

export async function addMultipleWorkDays(importedData: ImportedWorkDay[]) {
    try {
        const allWorkDays = await readWorkDays();
        const workDaysMap = new Map<string, WorkDay>();

        // Pré-popula o mapa com os dias de trabalho existentes
        allWorkDays.forEach(day => {
            const dateKey = format(new Date(day.date), 'yyyy-MM-dd');
            workDaysMap.set(dateKey, day);
        });

        // Processa os dados importados
        importedData.forEach(row => {
            if (!row.date) return;
            const dateKey = format(parseISO(row.date), 'yyyy-MM-dd');
            let day = workDaysMap.get(dateKey);

            if (!day) {
                day = {
                    id: Date.now().toString() + Math.random(),
                    date: parseISO(row.date),
                    km: 0,
                    hours: 0,
                    earnings: [],
                    fuelEntries: [],
                    maintenance: { description: '', amount: 0 }
                };
            }

            // Adiciona km e horas (apenas se for maior que o existente, para não zerar)
            day.km = Math.max(day.km, parseFloat(row.km) || 0);
            day.hours = Math.max(day.hours, parseFloat(row.hours) || 0);

            // Adiciona ganhos
            if (row.earnings_category && row.earnings_amount) {
                day.earnings.push({
                    id: Date.now() + Math.random(),
                    category: row.earnings_category,
                    trips: parseInt(row.earnings_trips) || 0,
                    amount: parseFloat(row.earnings_amount) || 0
                });
            }

            // Adiciona abastecimento
            if (row.fuel_type && row.fuel_paid) {
                day.fuelEntries.push({
                    id: Date.now() + Math.random(),
                    type: row.fuel_type,
                    paid: parseFloat(row.fuel_paid) || 0,
                    price: parseFloat(row.fuel_price) || 0
                });
            }

            // Adiciona manutenção (apenas um por dia, sobrescreve se houver múltiplos)
            if (row.maintenance_description && row.maintenance_amount) {
                day.maintenance = {
                    description: row.maintenance_description,
                    amount: parseFloat(row.maintenance_amount) || 0
                };
            }
            
            workDaysMap.set(dateKey, day);
        });

        const updatedWorkDays = Array.from(workDaysMap.values());
        await writeWorkDays(updatedWorkDays);
        
        revalidatePath('/');
        revalidatePath('/gerenciamento');
        revalidatePath('/relatorios');

        return { success: true, count: workDaysMap.size };

    } catch(e) {
        console.error("Error adding multiple work days: ", e);
        const errorMessage = e instanceof Error ? e.message : "Failed to import work days.";
        return { success: false, error: errorMessage };
    }
}

export async function updateWorkDay(id: string, data: Omit<WorkDay, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const allWorkDays = await readWorkDays();
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
    let allWorkDays = await readWorkDays();
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

export async function deleteWorkDays(idsToDelete: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        let allWorkDays = await readWorkDays();
        const initialLength = allWorkDays.length;
        const idsSet = new Set(idsToDelete);
        allWorkDays = allWorkDays.filter(day => !idsSet.has(day.id));
        
        if (allWorkDays.length === initialLength) {
             return { success: true }; // No records were found to delete, which is not an error.
        }
        
        await writeWorkDays(allWorkDays);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Falha ao apagar registros em massa.";
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
    
    const totalGanho = data.totalGanho;
    const totalLucroFinal = data.totalLucro;
    const totalCombustivelFinal = data.totalCombustivel;
    const totalManutencaoFinal = maintenanceData.totalSpent;
    
    const profitComposition = [
        { name: 'Lucro Líquido', value: totalLucroFinal, fill: 'hsl(var(--chart-1))', totalGanho },
        { name: 'Combustível', value: totalCombustivelFinal, fill: 'hsl(var(--chart-2))', totalGanho },
        { name: 'Manutenção', value: totalManutencaoFinal, fill: 'hsl(var(--chart-3))', totalGanho },
      ].filter(item => item.value !== 0);


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
        profitComposition: profitComposition
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
        const type = fuel.type || 'Não especificado';
        fuelExpensesMap.set(type, (fuelExpensesMap.get(type) || 0) + fuel.paid);
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
    { name: 'Combustível', value: totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho },
    { name: 'Manutenção', value: totalManutencaoFromWorkdays, fill: 'hsl(var(--chart-3))', totalGanho },
  ].filter(item => item.value !== 0);
  
  return {
    totalGanho,
    totalLucro,
    totalGastos,
    totalCombustivel,
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
