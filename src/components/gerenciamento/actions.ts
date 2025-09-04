
"use server"

import { revalidatePath } from "next/cache";
import { deleteWorkDay, updateWorkDay } from "@/services/work-day.service";
import type { WorkDay } from "@/services/work-day.service";

export async function updateWorkDayAction(workDay: WorkDay) {
    const result = await updateWorkDay(workDay.id, workDay);
    if (result.success) {
        revalidatePath("/gerenciamento");
    }
    return result;
}

export async function deleteWorkDayAction(workDayId: string) {
    const result = await deleteWorkDay(workDayId);
    if (result.success) {
        revalidatePath("/gerenciamento");
    }
    return result;
}
