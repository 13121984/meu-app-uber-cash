"use server";

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id: number; type: string; paid: number; price: number };

export interface WorkDay {
  date: Date;
  km: number;
  hours: number;
  earnings: Earning[];
  fuelEntries: FuelEntry[];
  maintenance: {
    description: string;
    amount: number;
  };
  // Ideally, this should be linked to a user ID
  // userId: string; 
}

export async function addWorkDay(data: WorkDay) {
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
