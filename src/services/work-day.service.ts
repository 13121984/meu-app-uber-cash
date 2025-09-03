"use server";

import { collection, addDoc, Timestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
        const q = query(collection(db, "workdays"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
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