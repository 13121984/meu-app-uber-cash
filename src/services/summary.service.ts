
"use server";

import { getFile, saveFile } from './storage.service';
import { getWorkDays, getFilteredWorkDays, WorkDay } from './work-day.service';
import { getGoals } from './goal.service';
import { getFilteredMaintenanceRecords, Maintenance } from './maintenance.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { format, startOfDay } from 'date-fns';

// --- Interfaces ---

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
  totalLitros: number;
  eficiencia: number;
  earningsByCategory: EarningsByCategory[];
  tripsByCategory: TripsByCategory[];
  maintenance: { totalSpent: number; servicesPerformed: number; };
  meta: { target: number; period: string };
  profitComposition: { name: string; value: number; fill: string; totalGanho: number; }[];
  performanceByShift: PerformanceByShift[];
}

export interface SummaryData {
    hoje: PeriodData;
    semana: PeriodData;
    mes: PeriodData;
}

export interface ReportData extends PeriodData {
    profitEvolution: ProfitEvolutionData[];
    fuelExpenses: FuelExpense[];
    dailyTrips: DailyTripsData[];
    averageEarningPerHour: AverageEarningByCategory[];
    averageEarningPerTrip: AverageEarningByCategory[];
    rawWorkDays: any[];
}


const FILE_NAME = 'summary.json';

const defaultPeriodData: PeriodData = {
    totalGanho: 0, totalLucro: 0, totalCombustivel: 0, totalExtras: 0,
    diasTrabalhados: 0, totalKm: 0, totalHoras: 0, totalLitros: 0, mediaHorasPorDia: 0, mediaKmPorDia: 0,
    ganhoPorHora: 0, ganhoPorKm: 0, totalViagens: 0, eficiencia: 0,
    earningsByCategory: [], tripsByCategory: [],
    maintenance: { totalSpent: 0, servicesPerformed: 0 },
    meta: { target: 0, period: '' },
    profitComposition: [], performanceByShift: [],
};

const defaultSummaryData: SummaryData = {
    hoje: { ...defaultPeriodData, meta: { target: 0, period: 'diária' } },
    semana: { ...defaultPeriodData, meta: { target: 0, period: 'semanal' } },
    mes: { ...defaultPeriodData, meta: { target: 0, period: 'mensal' } },
};

// --- Funções de Leitura/Escrita ---

export async function getSummaryData(userId: string): Promise<SummaryData> {
    if (!userId) return defaultSummaryData;
    return await getFile<SummaryData>(userId, FILE_NAME, defaultSummaryData);
}

export async function saveSummaryData(userId: string, data: SummaryData): Promise<void> {
    if (!userId) return;
    await saveFile(userId, FILE_NAME, data);
}

/**
 * Retorna os dados de resumo pré-calculados para um usuário.
 * Esta função apenas lê os dados do arquivo summary.json.
 */
export async function getSummaryForPeriod(userId: string): Promise<SummaryData> {
    return await getSummaryData(userId);
}

/**
 * Retorna apenas os dados de resumo do dia atual.
 */
export async function getTodayData(userId: string): Promise<PeriodData> {
    const summary = await getSummaryData(userId);
    return summary.hoje;
}

// --- Funções de Cálculo ---

const getShift = (time: string): 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite' => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 0 && hour < 6) return 'Madrugada';
  if (hour >= 6 && hour < 12) return 'Manhã';
  if (hour >= 12 && hour < 18) return 'Tarde';
  return 'Noite';
};

function calculatePeriodData(workDays: WorkDay[], maintenanceRecords: Maintenance[], goals: any, period: string): PeriodData {
    let totalGanho = 0, totalCombustivel = 0, totalExtras = 0, totalKm = 0, totalHoras = 0, totalViagens = 0, totalLitros = 0;
    const earningsByCategory = new Map<string, number>();
    const tripsByCategory = new Map<string, number>();
    const performanceByShift = new Map<string, { profit: number; hours: number }>();

    workDays.forEach(day => {
        totalKm += day.km;
        totalHoras += day.hours;

        day.earnings.forEach(e => {
            totalGanho += e.amount;
            totalViagens += e.trips;
            earningsByCategory.set(e.category, (earningsByCategory.get(e.category) || 0) + e.amount);
            tripsByCategory.set(e.category, (tripsByCategory.get(e.category) || 0) + e.trips);
        });

        day.fuelEntries.forEach(f => {
            totalCombustivel += f.paid;
            if(f.price > 0) totalLitros += f.paid / f.price;
        });
        
        day.maintenanceEntries.forEach(m => totalExtras += m.amount);

        day.timeEntries.forEach(t => {
            const shift = getShift(t.start);
            const entryHours = (new Date(`1970-01-01T${t.end}:00Z`).getTime() - new Date(`1970-01-01T${t.start}:00Z`).getTime()) / (1000 * 60 * 60);
            
            // Pro-rata earnings and fuel for this time entry
            const dayEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
            const dayFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);

            const shiftData = performanceByShift.get(shift) || { profit: 0, hours: 0 };
            shiftData.hours += entryHours;
            if (day.hours > 0) {
                 shiftData.profit += (dayEarnings - dayFuel) * (entryHours / day.hours);
            }
            performanceByShift.set(shift, shiftData);
        });
    });

    const maintenanceTotal = Array.isArray(maintenanceRecords) 
        ? maintenanceRecords.reduce((sum, record) => sum + record.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0)
        : 0;

    totalExtras += maintenanceTotal;
    
    const diasTrabalhados = new Set(workDays.map(d => startOfDay(d.date).toISOString())).size;
    const totalLucro = totalGanho - totalCombustivel - totalExtras;
    const mediaHorasPorDia = diasTrabalhados > 0 ? totalHoras / diasTrabalhados : 0;
    const mediaKmPorDia = diasTrabalhados > 0 ? totalKm / diasTrabalhados : 0;
    const ganhoPorHora = totalHoras > 0 ? totalGanho / totalHoras : 0;
    const ganhoPorKm = totalKm > 0 ? totalGanho / totalKm : 0;
    const eficiencia = totalLitros > 0 ? totalKm / totalLitros : 0;

    const profitComposition: PeriodData['profitComposition'] = [];
    if(totalGanho > 0) {
        profitComposition.push({ name: 'Lucro Líquido', value: totalLucro, fill: 'hsl(var(--chart-1))', totalGanho });
        profitComposition.push({ name: 'Combustível', value: totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho });
        if(totalExtras > 0) profitComposition.push({ name: 'Extras', value: totalExtras, fill: 'hsl(var(--chart-3))', totalGanho });
    }

    const finalPerformanceByShift = Array.from(performanceByShift.entries()).map(([shift, data]) => ({
        shift: shift as any, profit: data.profit, hours: data.hours,
        profitPerHour: data.hours > 0 ? data.profit / data.hours : 0
    }));

    return {
        totalGanho, totalLucro, totalCombustivel, totalExtras, diasTrabalhados, totalKm, totalHoras, totalViagens, totalLitros,
        mediaHorasPorDia, mediaKmPorDia, ganhoPorHora, ganhoPorKm, eficiencia,
        earningsByCategory: Array.from(earningsByCategory.entries()).map(([name, total]) => ({ name, total })),
        tripsByCategory: Array.from(tripsByCategory.entries()).map(([name, total]) => ({ name, total })),
        maintenance: { totalSpent: maintenanceTotal, servicesPerformed: Array.isArray(maintenanceRecords) ? maintenanceRecords.length : 0 },
        meta: { target: goals[period] || 0, period: `${period}` },
        profitComposition, performanceByShift: finalPerformanceByShift,
    };
}


/**
 * Recalcula e salva TODOS os resumos (hoje, semana, mês).
 * Esta deve ser a única função chamada após qualquer alteração nos dados.
 */
export async function updateAllSummaries(userId: string): Promise<void> {
    if (!userId) return;

    const allWorkDays = await getWorkDays(userId);
    const allMaintenance = await getFilteredMaintenanceRecords(userId); // Use getFiltered sem filtros para pegar todos.
    const goals = await getGoals(userId);

    const hojeWorkDays = getFilteredWorkDays(allWorkDays, { type: 'today' });
    const hojeMaintenance = getFilteredMaintenanceRecords(allMaintenance, { type: 'today' });
    const hojeData = calculatePeriodData(hojeWorkDays, hojeMaintenance, { today: goals.daily }, 'today');
    
    const semanaWorkDays = getFilteredWorkDays(allWorkDays, { type: 'thisWeek' });
    const semanaMaintenance = getFilteredMaintenanceRecords(allMaintenance, { type: 'thisWeek' });
    const semanaData = calculatePeriodData(semanaWorkDays, semanaMaintenance, { thisWeek: goals.weekly }, 'thisWeek');

    const mesWorkDays = getFilteredWorkDays(allWorkDays, { type: 'thisMonth' });
    const mesMaintenance = getFilteredMaintenanceRecords(allMaintenance, { type: 'thisMonth' });
    const mesData = calculatePeriodData(mesWorkDays, mesMaintenance, { thisMonth: goals.monthly }, 'thisMonth');
    
    const newSummaryData: SummaryData = {
        hoje: hojeData,
        semana: semanaData,
        mes: mesData,
    };

    await saveSummaryData(userId, newSummaryData);
}

// --- Funções para Relatórios ---

export async function generateReportData(userId: string, filters: ReportFilterValues): Promise<ReportData> {
    const allWorkDays = await getWorkDays(userId);
    const allMaintenance = await getFilteredMaintenanceRecords(userId);

    const filteredWorkDays = getFilteredWorkDays(allWorkDays, filters);
    const filteredMaintenance = getFilteredMaintenanceRecords(allMaintenance, filters);
    
    const periodData = calculatePeriodData(filteredWorkDays, filteredMaintenance, {}, 'custom');

    const profitEvolution = filteredWorkDays.map(day => ({
        date: format(day.date, 'dd/MM'),
        lucro: day.earnings.reduce((s, e) => s + e.amount, 0) - day.fuelEntries.reduce((s, f) => s + f.paid, 0) - (day.maintenanceEntries?.reduce((s,m) => s + m.amount, 0) || 0)
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const fuelExpensesMap = new Map<string, number>();
    filteredWorkDays.forEach(day => day.fuelEntries.forEach(f => fuelExpensesMap.set(f.type, (fuelExpensesMap.get(f.type) || 0) + f.paid)));

    const dailyTripsMap = new Map<string, number>();
    filteredWorkDays.forEach(day => {
        const dateKey = format(day.date, 'dd/MM');
        const trips = day.earnings.reduce((sum, e) => sum + e.trips, 0);
        dailyTripsMap.set(dateKey, (dailyTripsMap.get(dateKey) || 0) + trips);
    });

    const categoryStats = new Map<string, { totalAmount: number, totalHours: number, totalTrips: number }>();
    filteredWorkDays.forEach(day => {
        const dayTotalEarnings = day.earnings.reduce((s, e) => s + e.amount, 0);
        day.earnings.forEach(earning => {
            const stats = categoryStats.get(earning.category) || { totalAmount: 0, totalHours: 0, totalTrips: 0 };
            stats.totalAmount += earning.amount;
            stats.totalTrips += earning.trips;
            // CORREÇÃO: Pro-rata de horas com base na participação do ganho no dia
            if (day.hours > 0 && dayTotalEarnings > 0) {
                stats.totalHours += day.hours * (earning.amount / dayTotalEarnings);
            }
            categoryStats.set(earning.category, stats);
        });
    });

    return {
        ...periodData,
        profitEvolution,
        fuelExpenses: Array.from(fuelExpensesMap.entries()).map(([type, total]) => ({ type, total })),
        dailyTrips: Array.from(dailyTripsMap.entries()).map(([date, viagens]) => ({ date, viagens })),
        averageEarningPerHour: Array.from(categoryStats.entries()).map(([name, stats]) => ({ name, average: stats.totalHours > 0 ? stats.totalAmount / stats.totalHours : 0 })),
        averageEarningPerTrip: Array.from(categoryStats.entries()).map(([name, stats]) => ({ name, average: stats.totalTrips > 0 ? stats.totalAmount / stats.totalTrips : 0 })),
        rawWorkDays: filteredWorkDays,
    };
}
