
"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { startOfDay, parseISO, isSameMonth, isSameYear } from 'date-fns';

export interface PersonalExpense {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
}

const dataFilePath = path.join(process.cwd(), 'data', 'personal-expenses.json');

async function readPersonalExpenses(): Promise<PersonalExpense[]> {
  try {
    await fs.access(dataFilePath);
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    return (JSON.parse(fileContent) as any[]).map(record => ({
      ...record,
      date: new Date(record.date),
    }));
  } catch {
    await writePersonalExpenses([]);
    return [];
  }
}

async function writePersonalExpenses(data: PersonalExpense[]): Promise<void> {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    // Sort by most recent first before writing
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await fs.writeFile(dataFilePath, JSON.stringify(sortedData, null, 2), 'utf8');
}

/**
 * Adiciona um novo registro de despesa pessoal.
 */
export async function addPersonalExpense(data: Omit<PersonalExpense, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const allRecords = await readPersonalExpenses();
    const newRecord: PersonalExpense = {
        ...data,
        id: Date.now().toString(),
        date: startOfDay(new Date(data.date)),
    };
    allRecords.unshift(newRecord);
    await writePersonalExpenses(allRecords);

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
export async function getPersonalExpenses(): Promise<PersonalExpense[]> {
    let records = await readPersonalExpenses();
    return records;
}


/**
 * Calcula o total de despesas pessoais para o mês atual.
 */
export async function getCurrentMonthPersonalExpensesTotal(): Promise<number> {
    const allExpenses = await getPersonalExpenses();
    const now = new Date();
    
    return allExpenses
        .filter(expense => isSameMonth(expense.date, now) && isSameYear(expense.date, now))
        .reduce((sum, expense) => sum + expense.amount, 0);
}


/**
 * Atualiza um registro de despesa pessoal existente.
 */
export async function updatePersonalExpense(id: string, data: Omit<PersonalExpense, 'id'>): Promise<{ success: boolean; id?: string, error?: string }> {
  try {
    const allRecords = await readPersonalExpenses();
    const index = allRecords.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    allRecords[index] = { ...data, id, date: startOfDay(new Date(data.date)) };
    await writePersonalExpenses(allRecords);
    
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
export async function deletePersonalExpense(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    let allRecords = await readPersonalExpenses();
    allRecords = allRecords.filter(r => r.id !== id);
    await writePersonalExpenses(allRecords);
    
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
export async function deleteAllPersonalExpenses(): Promise<{ success: boolean; error?: string }> {
  try {
    await writePersonalExpenses([]);
    revalidatePath('/metas');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Falha ao apagar todas as despesas.";
    return { success: false, error: errorMessage };
  }
}
