'use server';

import { revalidatePath } from 'next/cache';
import {
  addOrUpdateWorkDay as serviceAddOrUpdate,
  deleteWorkDay as serviceDeleteWorkDay,
  clearAllDataForUser as serviceClearAllData
} from '@/services/work-day.service';
import { getGoals, Goals, saveGoals as serviceSaveGoals } from '@/services/goal.service';
import { addMaintenance as serviceAddMaintenance, updateMaintenance as serviceUpdateMaintenance, deleteMaintenance as serviceDeleteMaintenance, deleteAllMaintenance as serviceDeleteAllMaintenance } from '@/services/maintenance.service';
import { addPersonalExpense as serviceAddPersonalExpense, updatePersonalExpense as serviceUpdatePersonalExpense, deletePersonalExpense as serviceDeletePersonalExpense, deleteAllPersonalExpenses as serviceDeleteAllPersonalExpenses } from '@/services/personal-expense.service';
import { saveCatalog as serviceSaveCatalog, Catalog } from '@/services/catalog.service';
import { runBackupAction as serviceRunBackupAction, BackupInput, BackupOutput } from "@/ai/flows/backup-flow";

export async function addOrUpdateWorkDayAction(userId: string, workDay: any) {
    const result = await serviceAddOrUpdate(userId, workDay);
    if (result.success) {
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteWorkDayAction(userId: string, workDayId: string) {
    const result = await serviceDeleteWorkDay(userId, workDayId);
    if (result.success) {
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function saveGoalsAction(userId: string, goals: Goals) {
    const result = await serviceSaveGoals(userId, goals);
    if (result.success) {
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function addMaintenanceAction(userId: string, data: any) {
    const result = await serviceAddMaintenance(userId, data);
    if (result.success) {
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function updateMaintenanceAction(userId: string, id: string, data: any) {
    const result = await serviceUpdateMaintenance(userId, id, data);
    if (result.success) {
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteMaintenanceAction(userId: string, id: string) {
    const result = await serviceDeleteMaintenance(userId, id);
    if (result.success) {
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteAllMaintenanceAction(userId: string) {
    const result = await serviceDeleteAllMaintenance(userId);
    if (result.success) {
        revalidatePath('/manutencao');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function addPersonalExpenseAction(userId: string, data: any) {
    const result = await serviceAddPersonalExpense(userId, data);
    if (result.success) {
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function updatePersonalExpenseAction(userId: string, id: string, data: any) {
    const result = await serviceUpdatePersonalExpense(userId, id, data);
    if (result.success) {
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deletePersonalExpenseAction(userId: string, id: string) {
    const result = await serviceDeletePersonalExpense(userId, id);
    if (result.success) {
        revalidatePath('/metas');
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteAllPersonalExpensesAction(userId: string) {
    const result = await serviceDeleteAllPersonalExpenses(userId);
    if (result.success) {
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

export async function clearAllDataForUserAction(userId: string) {
    const result = await serviceClearAllData(userId);
    if (result.success) {
       revalidatePath('/', 'layout');
    }
    return result;
}
