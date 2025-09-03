
"use server";

import { collection, addDoc, Timestamp, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval } from 'date-fns';
import { PeriodData, EarningsByCategory, TripsByCategory } from "@/components/dashboard/dashboard-client";
import { getGoals, Goals } from './goal.service';


export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id: number; type: string; paid: number; price: number };

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
            workDays.push({
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            } as WorkDay);
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

    const data: Omit<PeriodData, 'meta' | 'ganhoPorHora' | 'ganhoPorKm' | 'earningsByCategory' | 'tripsByCategory'> = {
        totalGanho: 0,
        totalLucro: 0,
        totalCombustivel: 0,
        totalExtras: 0,
        diasTrabalhados: workDays.length,
        totalKm: 0,
        totalHoras: 0,
        totalViagens: 0,
    };

    workDays.forEach(day => {
        const dailyEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
        const dailyFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        // O lucro não considera mais a manutenção
        const dailyProfit = dailyEarnings - dailyFuel;

        data.totalGanho += dailyEarnings;
        data.totalCombustivel += dailyFuel;
        data.totalLucro += dailyProfit;
        data.totalKm += day.km;
        data.totalHoras += day.hours;
        
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
        earningsByCategory,
        tripsByCategory,
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
