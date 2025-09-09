
"use server"

import { revalidatePath } from "next/cache";
import { deleteWorkDaysByFilter, addOrUpdateWorkDay, deleteWorkDayEntry } from "@/services/work-day.service";
import type { WorkDay } from "@/services/work-day.service";
import type { ReportFilterValues } from "@/app/relatorios/actions";


export async function updateWorkDayAction(userId: string, workDay: WorkDay) {
    const result = await addOrUpdateWorkDay(userId, workDay);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/registrar/today");
        revalidatePath("/");
    }
    return result;
}

export async function deleteWorkDayEntryAction(userId: string, workDayId: string) {
    const result = await deleteWorkDayEntry(userId, workDayId);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/registrar/today");
        revalidatePath("/");
    }
    return result;
}

// Ação otimizada que recebe os filtros em vez dos dados
export async function deleteFilteredWorkDaysAction(userId: string, filters: ReportFilterValues) {
    const result = await deleteWorkDaysByFilter(userId, filters);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/");
    }
    return result;
}
