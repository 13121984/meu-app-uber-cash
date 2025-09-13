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
  if (!userId) return [];
  const data = await getFile<PersonalExpense[]>(userId, FILE_NAME, []);
  return (data || []).map(record => ({
    ...record,
    date: parseISO(record.date as any),
  }));
}

async function writePersonalExpenses(userId: string, data: PersonalExpense[]): Promise<void> {
    if (!userId) return;
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveFile(userId, FILE_NAME, sortedData);
}

export async function addPersonalExpense(userId: string, data: Omit<PersonalExpense, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    const allRecords = await readPersonalExpenses(userId);
    const newRecord: PersonalExpense = {
        ...data,
        id: Date.now().toString(),
        date: startOfDay(new Date(data.date)),
    };
    allRecords.unshift(newRecord);
    await writePersonalExpenses(userId, allRecords);
    return { success: true, id: newRecord.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Falha ao adicionar despesa." };
  }
}

export async function getPersonalExpenses(userId: string): Promise<PersonalExpense[]> {
    if (!userId) return [];
    return await readPersonalExpenses(userId);
}

export async function getCurrentMonthPersonalExpensesTotal(userId: string): Promise<number> {
    if (!userId) return 0;
    const allExpenses = await getPersonalExpenses(userId);
    const now = new Date();
    
    return allExpenses
        .filter(expense => isSameMonth(expense.date, now) && isSameYear(expense.date, now))
        .reduce((sum, expense) => sum + expense.amount, 0);
}

export async function updatePersonalExpense(userId: string, id: string, data: Omit<PersonalExpense, 'id'>): Promise<{ success: boolean; id?: string, error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    const allRecords = await readPersonalExpenses(userId);
    const index = allRecords.findIndex(r => r.id === id);
    if (index === -1) {
        return { success: false, error: "Registro não encontrado." };
    }
    allRecords[index] = { ...data, id, date: startOfDay(new Date(data.date)) };
    await writePersonalExpenses(userId, allRecords);
    return { success: true, id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Falha ao atualizar despesa." };
  }
}

export async function deletePersonalExpense(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    let allRecords = await readPersonalExpenses(userId);
    allRecords = allRecords.filter(r => r.id !== id);
    await writePersonalExpenses(userId, allRecords);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao apagar despesa." };
  }
}

export async function deleteAllPersonalExpenses(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Usuário não autenticado." };
  try {
    await writePersonalExpenses(userId, []);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Falha ao apagar todas as despesas." };
  }
}
