
"use server"

import { revalidatePath } from "next/cache";
import { deleteWorkDay, deleteWorkDays, updateWorkDay } from "@/services/work-day.service";
import type { WorkDay } from "@/services/work-day.service";

export async function updateWorkDayAction(workDay: WorkDay) {
    const result = await updateWorkDay(workDay.id, workDay);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/"); // Adicionado para revalidar a dashboard
    }
    return result;
}

export async function deleteWorkDayAction(workDayId: string) {
    const result = await deleteWorkDay(workDayId);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/"); // Adicionado para revalidar a dashboard
    }
    return result;
}

export async function deleteFilteredWorkDaysAction(filteredWorkDays: WorkDay[]) {
    const idsToDelete = filteredWorkDays.map(day => day.id);
    const result = await deleteWorkDays(idsToDelete);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/");
    }
    return result;
}
