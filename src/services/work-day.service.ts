
"use server";

import { collection, addDoc, Timestamp, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval } from 'date-fns';
import { PeriodData } from "@/components/dashboard/dashboard-client";

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
        // Retorna um array vazio em caso de erro para não quebrar a UI
        return [];
    }
}

function calculatePeriodData(workDays: WorkDay[], period: string): PeriodData {
    const data: PeriodData = {
        totalGanho: 0,
        totalLucro: 0,
        totalCombustivel: 0,
        totalExtras: 0,
        diasTrabalhados: workDays.length,
        totalKm: 0,
        totalHoras: 0,
        totalViagens: 0,
        meta: { target: 0, period: period }, 
    };

    workDays.forEach(day => {
        const dailyEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
        const dailyFuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        const dailyExtras = day.maintenance.amount;
        const dailyProfit = dailyEarnings - dailyFuel - dailyExtras;
        const dailyTrips = day.earnings.reduce((sum, e) => sum + e.trips, 0);

        data.totalGanho += dailyEarnings;
        data.totalCombustivel += dailyFuel;
        data.totalExtras += dailyExtras;
        data.totalLucro += dailyProfit;
        data.totalKm += day.km;
        data.totalHoras += day.hours;
        data.totalViagens += dailyTrips;
    });

    return data;
}


export async function getDashboardData() {
    const allWorkDays = await getWorkDays();
    const now = new Date();

    // Filtros de datas
    const todayWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfDay(now), end: endOfDay(now) }));
    const thisWeekWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfWeek(now), end: endOfWeek(now) }));
    const thisMonthWorkDays = allWorkDays.filter(day => isWithinInterval(day.date, { start: startOfMonth(now), end: endOfMonth(now) }));

    const hoje = calculatePeriodData(todayWorkDays, "diária");
    const semana = calculatePeriodData(thisWeekWorkDays, "semanal");
    const mes = calculatePeriodData(thisMonthWorkDays, "mensal");

    // Futuramente, as metas virão do banco de dados.
    // hoje.meta.target = 200;
    // semana.meta.target = 1000;
    // mes.meta.target = 4000;

    return { hoje, semana, mes };
}
