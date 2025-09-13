'use server';

import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { addOrUpdateWorkDay as serviceAddOrUpdate, deleteWorkDay as serviceDeleteWorkDay, getWorkDays, WorkDay, deleteWorkDaysByFilter as serviceDeleteFiltered } from '@/services/work-day.service';
import { getMaintenanceRecords, Maintenance, addMaintenance, updateMaintenance, deleteMaintenance as serviceDeleteMaintenance, deleteAllMaintenance } from '@/services/maintenance.service';
import { getGoals, Goals, saveGoals as serviceSaveGoals } from '@/services/goal.service';
import { getPersonalExpenses, addPersonalExpense, updatePersonalExpense, deletePersonalExpense, deleteAllPersonalExpenses } from '@/services/personal-expense.service';
import { saveSummaryData, SummaryData, PeriodData, defaultPeriodData } from '@/services/summary.service';
import { getCatalog, Catalog, saveCatalog as serviceSaveCatalog } from '@/services/catalog.service';
import { runBackupAction as serviceRunBackupAction, BackupInput, BackupOutput } from "@/ai/flows/backup-flow";

// --- LÓGICA DE CÁLCULO CENTRALIZADA ---

async function calculatePeriodData(workDays: WorkDay[], period: 'diária' | 'semanal' | 'mensal', goals: Goals, maintenanceRecords: Maintenance[]): Promise<PeriodData> {
    const earningsByCategoryMap = new Map<string, number>();
    const tripsByCategoryMap = new Map<string, number>();
    const shiftPerformanceMap = new Map<PeriodData['performanceByShift'][0]['shift'], { profit: number; hours: number, rawEarnings: number }>();

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

        const timeToMinutes = (time: string): number => {
            if (!time || !time.includes(':')) return 0;
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const getShift = (startTime: string): PeriodData['performanceByShift'][0]['shift'] => {
            if (typeof startTime !== 'string' || !startTime.includes(':')) return 'Manhã';
            const startMinutes = timeToMinutes(startTime);
            if (startMinutes >= timeToMinutes("06:01") && startMinutes <= timeToMinutes("12:00")) return 'Manhã';
            if (startMinutes > timeToMinutes("12:00") && startMinutes <= timeToMinutes("18:00")) return 'Tarde';
            if (startMinutes > timeToMinutes("18:00") && startMinutes <= timeToMinutes("23:59")) return 'Noite';
            return 'Madrugada';
        };

        if (day.timeEntries && day.timeEntries.length > 0 && day.timeEntries.every(t => t.start && t.end)) {
             const totalDayHoursFromEntries = day.timeEntries.reduce((sum, entry) => {
                const startMinutes = timeToMinutes(entry.start);
                const endMinutes = timeToMinutes(entry.end);
                return sum + (endMinutes > startMinutes ? (endMinutes - startMinutes) / 60 : 0);
            }, 0);

            if (totalDayHoursFromEntries > 0) {
                 day.timeEntries.forEach(entry => {
                    const entryHours = (timeToMinutes(entry.end) - timeToMinutes(entry.start)) / 60;
                    if (entryHours > 0) {
                        const shift = getShift(entry.start);
                        const shiftData = shiftPerformanceMap.get(shift) || { profit: 0, hours: 0, rawEarnings: 0 };
                        shiftData.profit += dailyProfit * (entryHours / totalDayHoursFromEntries);
                        shiftData.rawEarnings += dailyEarnings * (entryHours / totalDayHoursFromEntries);
                        shiftData.hours += entryHours;
                        shiftPerformanceMap.set(shift, shiftData);
                    }
                });
            }
        }
    });
    
    data.totalLucro -= maintenanceData.totalSpent;

    const earningsByCategory: { name: string; total: number; }[] = Array.from(earningsByCategoryMap, ([name, total]) => ({ name, total }));
    const tripsByCategory: { name: string; total: number; }[] = Array.from(tripsByCategoryMap, ([name, total]) => ({ name, total }));
    const performanceByShift: PeriodData['performanceByShift'] = Array.from(shiftPerformanceMap, ([shift, data]) => ({
        shift, profit: data.profit, hours: data.hours,
        profitPerHour: data.hours > 0 ? data.rawEarnings / data.hours : 0
    })).sort((a,b) => a.shift.localeCompare(b.shift));

    const profitComposition: { name: string; value: number; fill: string; totalGanho: number; }[] = [
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
        ganhoPorKm: data.totalKm > 0 ? data.totalGanho / data.totalKm : 0,
        eficiencia: data.totalKm > 0 && data.totalLitros > 0 ? data.totalKm / data.totalLitros : 0,
        earningsByCategory, tripsByCategory, maintenance: maintenanceData,
        meta: { target: targetGoal, period },
        profitComposition, performanceByShift,
    };
}

async function updateAllSummaries(userId: string) {
    const allWorkDays = await getWorkDays(userId);
    const allMaintenance = await getMaintenanceRecords(userId);
    const goals = await getGoals(userId);
    const now = new Date();

    const todayFilter = (d: WorkDay) => isWithinInterval(d.date, { start: startOfDay(now), end: endOfDay(now) });
    const weekFilter = (d: WorkDay) => isWithinInterval(d.date, { start: startOfWeek(now), end: endOfWeek(now) });
    const monthFilter = (d: WorkDay) => isWithinInterval(d.date, { start: startOfMonth(now), end: endOfMonth(now) });
    
    const todayMaintFilter = (m: Maintenance) => isWithinInterval(m.date, { start: startOfDay(now), end: endOfDay(now) });
    const weekMaintFilter = (m: Maintenance) => isWithinInterval(m.date, { start: startOfWeek(now), end: endOfWeek(now) });
    const monthMaintFilter = (m: Maintenance) => isWithinInterval(m.date, { start: startOfMonth(now), end: endOfMonth(now) });

    const [hoje, semana, mes] = await Promise.all([
        calculatePeriodData(allWorkDays.filter(todayFilter), 'diária', goals, allMaintenance.filter(todayMaintFilter)),
        calculatePeriodData(allWorkDays.filter(weekFilter), 'semanal', goals, allMaintenance.filter(weekMaintFilter)),
        calculatePeriodData(allWorkDays.filter(monthFilter), 'mensal', goals, allMaintenance.filter(monthMaintFilter)),
    ]);
    
    await saveSummaryData(userId, { hoje, semana, mes });
}


// --- ACTIONS ---

export async function addOrUpdateWorkDayAction(userId: string, workDay: WorkDay) {
    const result = await serviceAddOrUpdate(userId, workDay);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteWorkDayEntryAction(userId: string, workDayId: string) {
    const result = await serviceDeleteWorkDay(userId, workDayId);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteFilteredWorkDaysAction(userId: string, filters: any) {
    const result = await serviceDeleteFiltered(userId, filters);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function saveGoalsAction(userId: string, goals: Goals) {
    const result = await serviceSaveGoals(userId, goals);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function addMaintenanceAction(userId: string, data: Omit<Maintenance, 'id'>) {
    const result = await addMaintenance(userId, data);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function updateMaintenanceAction(userId: string, id: string, data: Omit<Maintenance, 'id'>) {
    const result = await updateMaintenance(userId, id, data);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteMaintenanceAction(userId: string, id: string) {
    const result = await serviceDeleteMaintenance(userId, id);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteAllMaintenanceAction(userId: string) {
    const result = await deleteAllMaintenance(userId);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function addPersonalExpenseAction(userId: string, data: any) {
    const result = await addPersonalExpense(userId, data);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function updatePersonalExpenseAction(userId: string, id: string, data: any) {
    const result = await updatePersonalExpense(userId, id, data);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deletePersonalExpenseAction(userId: string, id: string) {
    const result = await deletePersonalExpense(userId, id);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteAllPersonalExpensesAction(userId: string) {
    const result = await deleteAllPersonalExpenses(userId);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function saveCatalogAction(catalog: Catalog) {
    const result = await serviceSaveCatalog(catalog);
    if (result.success) {
        revalidatePath('/configuracoes/catalogos');
        revalidatePath('/registrar', 'layout');
    }
    return result;
}

export async function runBackupAction(input: BackupInput): Promise<BackupOutput> {
    const result = await serviceRunBackupAction(input);
    if (result.success) {
        revalidatePath('/configuracoes/backup');
    }
    return result;
}

export async function updateAllSummariesAction(userId: string) {
    await updateAllSummaries(userId);
    revalidatePath('/', 'layout');
}
