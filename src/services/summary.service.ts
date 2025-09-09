
"use server";

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, startOfYear, endOfYear, format, parseISO, isSameDay } from 'date-fns';
import { getGoals, Goals } from './goal.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getMaintenanceRecords, Maintenance } from './maintenance.service';
import { getWorkDays, WorkDay } from './work-day.service';
import { getFile, saveFile } from './storage.service';
import { getActiveUser } from './auth.service';

export interface EarningsByCategory { name: string; total: number; }
export interface TripsByCategory { name: string; total: number; }
export interface PerformanceByShift { shift: 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite'; profit: number; hours: number; profitPerHour: number; }
export interface FuelExpense { type: string; total: number; }
export interface ProfitEvolutionData { date: string; lucro: number; }
export interface DailyTripsData { date: string; viagens: number; }
export interface AverageEarningByCategory { name: string; average: number; }

export interface PeriodData {
  totalGanho: number;
  totalLucro: number;
  totalCombustivel: number;
  totalExtras: number;
  diasTrabalhados: number;
  totalKm: number;
  totalHoras: number;
  mediaHorasPorDia: number;
  mediaKmPorDia: number;
  ganhoPorHora: number;
  ganhoPorKm: number;
  totalViagens: number;
  eficiencia: number;
  earningsByCategory: EarningsByCategory[];
  tripsByCategory: TripsByCategory[];
  maintenance: { totalSpent: number; servicesPerformed: number; };
  meta: { target: number; period: string };
  profitComposition: { name: string; value: number; fill: string; totalGanho: number; }[];
  performanceByShift?: PerformanceByShift[];
}

export interface SummaryData {
    hoje: PeriodData;
    semana: PeriodData;
    mes: PeriodData;
}

export interface ReportData extends Omit<PeriodData, 'performanceByShift'> {
  totalGastos: number;
  fuelExpenses: FuelExpense[];
  profitEvolution: ProfitEvolutionData[];
  dailyTrips: DailyTripsData[];
  averageEarningPerTrip: AverageEarningByCategory[];
  averageEarningPerHour: AverageEarningByCategory[];
  rawWorkDays: WorkDay[];
}

const FILE_NAME = 'summary.json';

const defaultPeriodData: PeriodData = {
    totalGanho: 0, totalLucro: 0, totalCombustivel: 0, totalExtras: 0,
    diasTrabalhados: 0, totalKm: 0, totalHoras: 0, mediaHorasPorDia: 0, mediaKmPorDia: 0,
    ganhoPorHora: 0, ganhoPorKm: 0, totalViagens: 0, eficiencia: 0,
    earningsByCategory: [], tripsByCategory: [],
    maintenance: { totalSpent: 0, servicesPerformed: 0 },
    meta: { target: 0, period: '' },
    profitComposition: [], performanceByShift: [],
};

const defaultSummaryData: SummaryData = {
    hoje: defaultPeriodData,
    semana: defaultPeriodData,
    mes: defaultPeriodData,
}

export async function getSummaryForPeriod(): Promise<SummaryData> {
    const user = await getActiveUser();
    if (!user) return defaultSummaryData;
    return await getFile<SummaryData>(user.id, FILE_NAME, defaultSummaryData);
}

export async function getTodayData(): Promise<PeriodData> {
    const user = await getActiveUser();
    if (!user) return defaultPeriodData;
    const summary = await getSummaryForPeriod();
    return summary.hoje;
}

export async function updateAllSummaries(userId: string): Promise<SummaryData> {
    const allWorkDays = await getWorkDays(userId);
    const allMaintenance = await getMaintenanceRecords(userId);
    const goals = await getGoals(userId);
    const now = new Date();

    const todayWorkDays = allWorkDays.filter(day => isSameDay(day.date, now));
    const thisWeekWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfMonth(now), end: endOfMonth(now) }));
    
    const todayMaintenance = allMaintenance.filter(m => isSameDay(m.date, now));
    const thisWeekMaintenance = allMaintenance.filter(m => isWithinInterval(m.date, { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthMaintenance = allMaintenance.filter(m => isWithinInterval(m.date, { start: startOfMonth(now), end: endOfMonth(now) }));

    const hoje = calculatePeriodData(todayWorkDays, "diária", goals, todayMaintenance);
    const semana = calculatePeriodData(thisWeekWorkDays, "semanal", goals, thisWeekMaintenance);
    const mes = calculatePeriodData(thisMonthWorkDays, "mensal", goals, thisMonthMaintenance);

    const summaryData = { hoje, semana, mes };
    await saveFile(userId, FILE_NAME, summaryData);
    return summaryData;
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
    const shiftPerformanceMap = new Map<PerformanceByShift['shift'], { profit: number; hours: number, rawEarnings: number }>();

    const data = {
        totalGanho: 0, totalLucro: 0, totalCombustivel: 0, totalExtras: 0,
        diasTrabalhados: new Set(workDays.map(d => d.date.toDateString())).size,
        totalKm: 0, totalHoras: 0, totalViagens: 0, totalLitros: 0,
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
        
        day.fuelEntries.forEach(fuel => { if (fuel.price > 0) { data.totalLitros += fuel.paid / fuel.price; } });
        
        day.earnings.forEach(earning => {
            earningsByCategoryMap.set(earning.category, (earningsByCategoryMap.get(earning.category) || 0) + earning.amount);
            tripsByCategoryMap.set(earning.category, (tripsByCategoryMap.get(earning.category) || 0) + earning.trips);
            data.totalViagens += earning.trips;
        });

        if (day.timeEntries && day.timeEntries.length > 0) {
             const totalDayHours = day.timeEntries.reduce((sum, entry) => {
                const startMinutes = timeToMinutes(entry.start);
                const endMinutes = timeToMinutes(entry.end);
                return sum + (endMinutes > startMinutes ? (endMinutes - startMinutes) / 60 : 0);
            }, 0);

            if (totalDayHours > 0) {
                 day.timeEntries.forEach(entry => {
                    const entryHours = (timeToMinutes(entry.end) - timeToMinutes(entry.start)) / 60;
                    if (entryHours > 0) {
                        const shift = getShift(entry.start);
                        const shiftData = shiftPerformanceMap.get(shift) || { profit: 0, hours: 0, rawEarnings: 0 };
                        // Pro-rata allocation of daily profit/earnings to shifts based on hours worked
                        shiftData.profit += dailyProfit * (entryHours / totalDayHours);
                        shiftData.rawEarnings += dailyEarnings * (entryHours / totalDayHours);
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
        profit: data.profit, 
        hours: data.hours,
        // Use rawEarnings for profitPerHour calculation
        profitPerHour: data.hours > 0 ? data.rawEarnings / data.hours : 0
    })).sort((a,b) => a.shift.localeCompare(b.shift));

    const profitComposition = [
        { name: 'Lucro Líquido', value: data.totalLucro, fill: 'hsl(var(--chart-1))', totalGanho: data.totalGanho },
        { name: 'Combustível', value: data.totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho: data.totalGanho },
        { name: 'Manutenção', value: maintenanceData.totalSpent, fill: 'hsl(var(--chart-3))', totalGanho: data.totalGanho },
      ].filter(item => item.value !== 0);

    let targetGoal = 0;
    if (period === 'diária') targetGoal = goals.daily;
    else if (period === 'semanal') targetGoal = goals.weekly;
    else if (period === 'mensal') targetGoal = goals.monthly;

    return {
        ...data,
        mediaHorasPorDia: data.diasTrabalhados > 0 ? data.totalHoras / data.diasTrabalhados : 0,
        mediaKmPorDia: data.diasTrabalhados > 0 ? data.totalKm / data.diasTrabalhados : 0,
        ganhoPorHora: data.totalHoras > 0 ? data.totalGanho / data.totalHoras : 0,
        ganhoPorKm: data.totalKm > 0 ? data.totalGanho / data.km : 0,
        eficiencia: data.totalKm > 0 && data.totalLitros > 0 ? data.totalKm / data.totalLitros : 0,
        earningsByCategory, tripsByCategory, maintenance: maintenanceData,
        meta: { target: targetGoal, period },
        profitComposition, performanceByShift,
    };
}

export async function getReportData(userId: string, filters: ReportFilterValues): Promise<ReportData> {
  const now = new Date();
  let filteredDays: WorkDay[] = [];
  let interval: { start: Date; end: Date } | null = null;
  const allWorkDays = await getWorkDays(userId);
  const goals = await getGoals(userId);

  switch (filters.type) {
    case 'all': filteredDays = allWorkDays; break;
    case 'today': interval = { start: startOfDay(now), end: endOfDay(now) }; break;
    case 'thisWeek': interval = { start: startOfWeek(now), end: endOfWeek(now) }; break;
    case 'thisMonth': interval = { start: startOfMonth(now), end: endOfMonth(now) }; break;
    case 'specificMonth': if (filters.year !== undefined && filters.month !== undefined) { interval = { start: startOfMonth(new Date(filters.year, filters.month)), end: endOfMonth(new Date(filters.year, filters.month)) }; } break;
    case 'specificYear': if (filters.year !== undefined) { interval = { start: startOfYear(new Date(filters.year, 0)), end: endOfYear(new Date(filters.year, 0)) }; } break;
    case 'custom': if (filters.dateRange?.from) { interval = { start: startOfDay(filters.dateRange.from), end: filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(filters.dateRange.from) }; } break;
  }
  
  if (interval && filters.type !== 'all') {
    filteredDays = allWorkDays.filter(d => isWithinInterval(d.date, interval!));
  } else if (!interval && filters.type !== 'all') {
    filteredDays = [];
  }
  
  const allMaintenance = await getMaintenanceRecords(userId);
  const filteredMaintenance = interval 
    ? allMaintenance.filter(m => isWithinInterval(m.date, interval!))
    : allMaintenance;

  const earningsByCategoryMap = new Map<string, number>();
  const tripsByCategoryMap = new Map<string, number>();
  const hoursByCategoryMap = new Map<string, number>();
  const fuelExpensesMap = new Map<string, number>();
  const dailyDataMap = new Map<string, { lucro: number, viagens: number }>();

  let totalGanho = 0, totalCombustivel = 0, totalKm = 0, totalHoras = 0, totalViagens = 0, totalLitros = 0;
  const diasTrabalhados = new Set(filteredDays.map(d => d.date.toDateString())).size;
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
        fuelExpensesMap.set(fuel.type || 'Não especificado', (fuelExpensesMap.get(fuel.type) || 0) + fuel.paid);
    });

    day.earnings.forEach(earning => {
        earningsByCategoryMap.set(earning.category, (earningsByCategoryMap.get(earning.category) || 0) + earning.amount);
        tripsByCategoryMap.set(earning.category, (tripsByCategoryMap.get(earning.category) || 0) + earning.trips);
        if (dailyEarnings > 0 && day.hours > 0) {
            hoursByCategoryMap.set(earning.category, (hoursByCategoryMap.get(earning.category) || 0) + (earning.amount / dailyEarnings) * day.hours);
        }
    });

    const dateKey = format(day.date, 'yyyy-MM-dd');
    const currentDaily = dailyDataMap.get(dateKey) || { lucro: 0, viagens: 0 };
    dailyDataMap.set(dateKey, { lucro: currentDaily.lucro + dailyProfit, viagens: currentDaily.viagens + dailyTrips });
  });
  
  const totalLucro = totalGanho - totalCombustivel - totalManutencaoFinal;
  
  const sortedDailyEntries = Array.from(dailyDataMap.entries()).sort((a, b) => parseISO(a[0]).getTime() - parseISO(b[0]).getTime());

  const getTargetGoal = () => {
    switch (filters.type) {
        case 'today': return goals.daily;
        case 'thisWeek': return goals.weekly;
        case 'thisMonth': return goals.monthly;
        case 'specificMonth': return goals.monthly;
        default: return 0;
    }
  }

  return {
    totalGanho, totalLucro, totalCombustivel, totalExtras: 0, diasTrabalhados, totalKm, totalHoras,
    totalGastos: totalCombustivel + totalManutencaoFinal,
    mediaHorasPorDia: diasTrabalhados > 0 ? totalHoras / diasTrabalhados : 0,
    mediaKmPorDia: diasTrabalhados > 0 ? totalKm / diasTrabalhados : 0,
    ganhoPorHora: totalHoras > 0 ? totalGanho / totalHoras : 0,
    ganhoPorKm: totalKm > 0 ? totalGanho / totalKm : 0,
    totalViagens, eficiencia: totalKm > 0 && totalLitros > 0 ? totalKm / totalLitros : 0,
    earningsByCategory: Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total })),
    tripsByCategory: Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total })),
    maintenance: { totalSpent: totalManutencaoFinal, servicesPerformed: filteredMaintenance.length },
    profitComposition: [
      { name: 'Lucro Líquido', value: totalLucro, fill: 'hsl(var(--chart-1))', totalGanho },
      { name: 'Combustível', value: totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho },
      { name: 'Manutenção', value: totalManutencaoFinal, fill: 'hsl(var(--chart-3))', totalGanho },
    ].filter(item => item.value > 0),
    fuelExpenses: Array.from(fuelExpensesMap, ([type, total]) => ({ type, total })),
    profitEvolution: sortedDailyEntries.map(([dateKey, data]) => ({ date: format(parseISO(dateKey), 'dd/MM'), lucro: data.lucro })),
    dailyTrips: sortedDailyEntries.map(([dateKey, data]) => ({ date: format(parseISO(dateKey), 'dd/MM'), viagens: data.viagens })),
    averageEarningPerTrip: Array.from(earningsByCategoryMap, ([name, total]) => ({ name, average: (tripsByCategoryMap.get(name) || 0) > 0 ? total / (tripsByCategoryMap.get(name) || 1) : 0 })).filter(item => item.average > 0),
    averageEarningPerHour: Array.from(earningsByCategoryMap, ([name, total]) => ({ name, average: (hoursByCategoryMap.get(name) || 0) > 0 ? total / (hoursByCategoryMap.get(name) || 1) : 0 })).filter(item => item.average > 0),
    rawWorkDays: filteredDays,
    meta: {
      target: getTargetGoal(),
      period: filters.type || 'all',
    }
  };
}

    