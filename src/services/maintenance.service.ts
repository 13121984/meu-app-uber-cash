
"use server";

import { collection, addDoc, Timestamp, getDocs, query, orderBy, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

export interface Maintenance {
  id?: string;
  date: Date;
  description: string;
  amount: number;
}


// --- Funções CRUD ---

/**
 * Adiciona um novo registro de manutenção no Firestore.
 * Retorna o ID do novo documento.
 */
export async function addMaintenance(data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "maintenance"), {
      ...data,
      date: Timestamp.fromDate(data.date),
      createdAt: Timestamp.now(),
    });

    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error adding maintenance document: ", e);
    const errorMessage = e instanceof Error ? e.message : "Falha ao adicionar registro de manutenção.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Busca todos os registros de manutenção.
 */
export async function getMaintenanceRecords(): Promise<Maintenance[]> {
    try {
        const maintenanceCollection = collection(db, "maintenance");
        const q = query(maintenanceCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                description: data.description,
                amount: data.amount,
                date: (data.date as Timestamp).toDate(),
            };
        });
    } catch (error) {
        console.error("Error getting maintenance records: ", error);
        return [];
    }
}

/**
 * Atualiza um registro de manutenção existente.
 */
export async function updateMaintenance(id: string, data: Omit<Maintenance, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "maintenance", id);
    await updateDoc(docRef, {
        ...data,
        date: Timestamp.fromDate(data.date)
    });
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error("Error updating maintenance document: ", e);
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar registro.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apaga um registro de manutenção.
 */
export async function deleteMaintenance(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "maintenance", id);
    await deleteDoc(docRef);
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting maintenance document: ", error);
    return { success: false, error: "Falha ao apagar registro." };
  }
}

/**
 * Apaga todos os registros de manutenção.
 */
export async function deleteAllMaintenance(): Promise<{ success: boolean; error?: string }> {
  try {
    const maintenanceCollection = collection(db, "maintenance");
    const q = query(maintenanceCollection);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: true };
    }
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    revalidatePath('/manutencao');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting all maintenance documents: ", error);
    return { success: false, error: "Falha ao apagar todos os registros." };
  }
}
