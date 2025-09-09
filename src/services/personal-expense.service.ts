
"use server";

import { revalidatePath } from 'next/cache';
import { startOfDay, parseISO, isSameMonth, isSameYear } from 'date-fns';
import { getFile, saveFile } from './storage.service';

export interface PersonalExpense {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
}

const FILE_NAME = 'personal-expenses.json';

async function readPersonalExpenses(userId: string): Promise<PersonalExpense[]> {
  const data = await getFile<PersonalExpense[]>(userId, FILE_NAME, []);
  return (data || []).map(record => ({
    ...record,
    date: parseISO(record.date as any),
  }));
}

async function writePersonalExpenses(userId: string, data: PersonalExpense[]): Promise<void> {
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveFile(userId, FILE_NAME, sortedData);
}

/**
 * Adiciona um novo registro de despesa pessoal.
 */
export async function addPersonalExpense(userId: string, data: Omit<PersonalExpense, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const allRecords = await readPersonalExpenses(userId);
    const newRecord: PersonalExpense = {
        ...data,
        id: Date.now().toString(),
        date: startOfDay(new Date(data.date)),
    };
    allRecords.unshift(newRecord);
    await writePersonalExpenses(userId, allRecords);

    revalidatePath('/metas');
    return { success: true, id: newRecord.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao adicionar despesa.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Busca todos os registros de despesas pessoais.
 */
export async function getPersonalExpenses(userId: string): Promise<PersonalExpense[]> {
    let records = await readPersonalExpenses(userId);
    return records;
}


/**
 * Calcula o total de despesas pessoais para o mês atual.
 */
export async function getCurrentMonthPersonalExpensesTotal(userId: string): Promise<number> {
    const allExpenses = await getPersonalExpenses(userId);
    const now = new Date();
    
    return allExpenses
        .filter(expense => isSameMonth(expense.date, now) && isSameYear(expense.date, now))
        .reduce((sum, expense) => sum + expense.amount, 0);
}


/**
 * Atualiza um registro de despesa pessoal existente.
 */
export async function updatePersonalExpense(userId: string, id: string, data: Omit<PersonalExpense, 'id'>): Promise<{ success: boolean; id?: string, error?: string }> {
  try {
    const allRecords = await readPersonalExpenses(userId);
    const index = allRecords.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    allRecords[index] = { ...data, id, date: startOfDay(new Date(data.date)) };
    await writePersonalExpenses(userId, allRecords);
    
    revalidatePath('/metas');
    return { success: true, id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Falha ao atualizar despesa.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apaga um registro de despesa pessoal.
 */
export async function deletePersonalExpense(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allRecords = await readPersonalExpenses(userId);
    allRecords = allRecords.filter(r => r.id !== id);
    await writePersonalExpenses(userId, allRecords);
    
    revalidatePath('/metas');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar despesa.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apaga todos os registros de despesas pessoais.
 */
export async function deleteAllPersonalExpenses(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await writePersonalExpenses(userId, []);
    revalidatePath('/metas');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todas as despesas.";
    return { success: false, error: errorMessage };
  }
}
