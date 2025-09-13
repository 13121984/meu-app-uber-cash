
'use server';

import { getFile, saveFile } from './storage.service';
import type { WorkDay } from './work-day.service';
import type { Goals } from './goal.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import type { Maintenance } from './maintenance.service';

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

export const defaultPeriodData: PeriodData = {
    totalGanho: 0, totalLucro: 0, totalCombustivel: 0, totalExtras: 0,
    diasTrabalhados: 0, totalKm: 0, totalHoras: 0, totalLitros: 0, mediaHorasPorDia: 0, mediaKmPorDia: 0,
    ganhoPorHora: 0, ganhoPorKm: 0, totalViagens: 0, eficiencia: 0,
    earningsByCategory: [], tripsByCategory: [],
    maintenance: { totalSpent: 0, servicesPerformed: 0 },
    meta: { target: 0, period: '' },
    profitComposition: [], performanceByShift: [],
};

export const defaultSummaryData: SummaryData = {
    hoje: { ...defaultPeriodData, meta: { target: 0, period: 'diária' } },
    semana: { ...defaultPeriodData, meta: { target: 0, period: 'semanal' } },
    mes: { ...defaultPeriodData, meta: { target: 0, period: 'mensal' } },
};


// --- Funções do Serviço ---

export async function getSummaryData(userId: string): Promise<SummaryData> {
    if (!userId) return defaultSummaryData;
    const data = await getFile<SummaryData>(userId, FILE_NAME, defaultSummaryData);
    if (data.hoje) data.hoje.meta.period = 'diária';
    if (data.semana) data.semana.meta.period = 'semanal';
    if (data.mes) data.mes.meta.period = 'mensal';
    return data;
}

export async function saveSummaryData(userId: string, data: SummaryData): Promise<void> {
    if (!userId) return;
    await saveFile(userId, FILE_NAME, data);
}

export async function getTodayData(userId: string): Promise<PeriodData> {
    if (!userId) return defaultPeriodData;
    const summary = await getSummaryData(userId);
    return summary.hoje;
}

export async function getSummaryForPeriod(userId: string): Promise<SummaryData> {
    if (!userId) return defaultSummaryData;
    return await getSummaryData(userId);
}


export async function getReportData(userId: string, filters: ReportFilterValues): Promise<ReportData> {
    const summary = await getSummaryData(userId);
    let periodData: PeriodData;

    switch (filters.type) {
        case 'today':
            periodData = summary.hoje;
            break;
        case 'thisWeek':
            periodData = summary.semana;
            break;
        case 'thisMonth':
        default:
            periodData = summary.mes;
            break;
    }

    const { performanceByShift, ...restOfPeriodData } = periodData;

    return {
        ...restOfPeriodData,
        totalGastos: periodData.totalCombustivel + periodData.maintenance.totalSpent,
        fuelExpenses: [],
        profitEvolution: [],
        dailyTrips: [],
        averageEarningPerTrip: [],
        averageEarningPerHour: [],
        rawWorkDays: [],
    };
}
