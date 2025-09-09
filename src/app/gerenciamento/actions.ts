
"use server"

import { revalidatePath } from "next/cache";
import { deleteWorkDaysByFilter, addOrUpdateWorkDay, deleteWorkDayEntry } from "@/services/work-day.service";
import type { WorkDay } from "@/services/work-day.service";
import { z } from 'zod';
import { parseISO, format } from 'date-fns';
import type { ReportFilterValues } from "@/app/relatorios/actions";
import { updateAllSummaries } from "@/services/summary.service";


export async function updateWorkDayAction(userId: string, workDay: WorkDay) {
    const result = await addOrUpdateWorkDay(userId, workDay);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath("/gerenciamento");
        revalidatePath("/registrar/today");
        revalidatePath("/");
    }
    return result;
}

export async function deleteWorkDayEntryAction(userId: string, workDayId: string) {
    const result = await deleteWorkDayEntry(userId, workDayId);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath("/gerenciamento");
        revalidatePath("/registrar/today");
        revalidatePath("/");
    }
    return result;
}

const FilterSchema = z.object({
    type: z.enum(['all', 'today', 'thisWeek', 'thisMonth', 'specificMonth', 'specificYear', 'custom']),
    year: z.number().optional(),
    month: z.number().optional(),
    dateRange: z.custom<any>().optional(),
});

export type ActiveFilters = z.infer<typeof FilterSchema>;

// Ação otimizada que recebe os filtros em vez dos dados
export async function deleteFilteredWorkDaysAction(userId: string, filters: ReportFilterValues) {
    const validatedFilters = FilterSchema.parse(filters);
    const result = await deleteWorkDaysByFilter(userId, validatedFilters);
    if (result.success) {
        await updateAllSummaries(userId);
        revalidatePath("/gerenciamento");
        revalidatePath("/");
    }
    return result;
}
