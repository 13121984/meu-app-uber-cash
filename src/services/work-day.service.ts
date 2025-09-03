
"use server";

import { collection, addDoc, Timestamp, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, sub, eachDayOfInterval, format } from 'date-fns';
import { PeriodData, EarningsByCategory, TripsByCategory, MaintenanceData } from "@/components/dashboard/dashboard-client";
import { getGoals, Goals } from './goal.service';
import type { ReportFilterValues } from '@/components/relatorios/reports-filter';


export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id:number; type: string; paid: number; price: number };

export interface WorkDay {
  id?: string;
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
}

export async function addWorkDay(data: Omit<WorkDay, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, "workdays"), {
      ...data,
      date: Timestamp.fromDate(data.date),
      createdAt: Timestamp.now(),
    });
    console.log("Document written with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: "Failed to save work day." };
  }
}

export async function getWorkDays(): Promise<WorkDay[]> {
    try {
        const workdaysCollection = collection(db, "workdays");
        const q = query(workdaysCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("No documents found in workdays collection.");
            return [];
        }

        const workDays: WorkDay[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const workDayData = {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            };
            delete (workDayData as any).createdAt;
            
            workDays.push(workDayData as WorkDay);
        });
        return workDays;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}

function calculatePeriodData(workDays: WorkDay[], period: string, goals: Goals): PeriodData {
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

    const maintenanceData: MaintenanceData = {
        totalSpent: 0,
        servicesPerformed: 0,
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
        
        if (day.maintenance && day.maintenance.amount > 0) {
            maintenanceData.totalSpent += day.maintenance.amount;
            maintenanceData.servicesPerformed += 1;
        }

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
    const goals = await getGoals();
    const now = new Date();

    const todayWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfDay(now), end: endOfDay(now) }));
    const thisWeekWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfMonth(now), end: endOfMonth(now) }));

    const hoje = calculatePeriodData(todayWorkDays, "diária", goals);
    const semana = calculatePeriodData(thisWeekWorkDays, "semanal", goals);
    const mes = calculatePeriodData(thisMonthWorkDays, "mensal", goals);

    return { hoje, semana, mes };
}


// Nova função para a página de Relatórios
export async function getReportData(allWorkDays: WorkDay[], filters: ReportFilterValues): Promise<ReportData> {
  const now = new Date();
  let filteredDays: WorkDay[] = [];
  let interval: { start: Date; end: Date } | null = null;

  switch (filters.type) {
    case 'all':
      if (allWorkDays.length > 0) {
        const dates = allWorkDays.map(d => d.date);
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
    filteredDays = allWorkDays.filter(d => isWithinInterval(d.date, interval!));
  }


  // --- Cálculos ---
  const earningsByCategoryMap = new Map<string, number>();
  const tripsByCategoryMap = new Map<string, number>();
  const fuelExpensesMap = new Map<string, number>();
  const dailyDataMap = new Map<string, { lucro: number, viagens: number }>();

  let totalGanho = 0, totalCombustivel = 0, totalExtras = 0, totalKm = 0, totalHoras = 0, totalViagens = 0, totalLitros = 0;

  filteredDays.forEach(day => {
    const dailyEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const dailyFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const dailyTrips = day.earnings.reduce((sum, e) => sum + e.trips, 0);

    totalGanho += dailyEarnings;
    totalCombustivel += dailyFuel;
    totalExtras += day.maintenance.amount;
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

    const dateKey = format(day.date, 'yyyy-MM-dd');
    const currentDaily = dailyDataMap.get(dateKey) || { lucro: 0, viagens: 0 };
    currentDaily.lucro += dailyEarnings - dailyFuel;
    currentDaily.viagens += dailyTrips;
    dailyDataMap.set(dateKey, currentDaily);
  });
  
  const profitEvolution: ProfitEvolutionData[] = [];
  const dailyTrips: DailyTripsData[] = [];
  if (interval) {
      eachDayOfInterval(interval).forEach(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const data = dailyDataMap.get(dateKey);
          profitEvolution.push({ date: format(date, 'dd/MM'), lucro: data?.lucro ?? 0 });
          dailyTrips.push({ date: format(date, 'dd/MM'), viagens: data?.viagens ?? 0 });
      })
  } else if (dailyDataMap.size > 0) {
      // Fallback for 'all' when interval is not set initially
      [...dailyDataMap.entries()].sort().forEach(([dateKey, data]) => {
          profitEvolution.push({ date: format(new Date(dateKey), 'dd/MM'), lucro: data.lucro });
          dailyTrips.push({ date: format(new Date(dateKey), 'dd/MM'), viagens: data.viagens });
      })
  }


  const totalGastos = totalCombustivel + totalExtras;
  const totalLucro = totalGanho - totalCombustivel; 
  const ganhoPorHora = totalHoras > 0 ? totalGanho / totalHoras : 0;
  const ganhoPorKm = totalKm > 0 ? totalGanho / totalKm : 0;
  const eficiencia = totalKm > 0 && totalLitros > 0 ? totalKm / totalLitros : 0;
  const earningsByCategory: EarningsByCategory[] = Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total }));
  const tripsByCategory: TripsByCategory[] = Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total }));
  const fuelExpenses: FuelExpense[] = Array.from(fuelExpensesMap, ([type, total]) => ({ type, total }));

  const profitComposition = [
    { name: 'Lucro Líquido', value: totalLucro, fill: 'hsl(var(--chart-1))', totalGanho },
    { name: 'Combustível', value: totalCombustivel, fill: 'hsl(var(--chart-5))', totalGanho },
  ];
  
  return {
    totalGanho,
    totalLucro,
    totalGastos,
    diasTrabalhados: new Set(filteredDays.map(d => d.date.toDateString())).size,
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
  };
}
