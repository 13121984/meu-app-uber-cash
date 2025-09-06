
"use server"

import { revalidatePath } from "next/cache";
import { deleteWorkDay, deleteWorkDaysByFilter, getWorkDays, addOrUpdateWorkDay } from "@/services/work-day.service";
import type { WorkDay } from "@/services/work-day.service";
import { z } from 'zod';
import { parseISO, format } from 'date-fns';

export async function updateWorkDayAction(workDay: WorkDay) {
    // A função de serviço agora lida com a lógica de criar vs atualizar.
    const result = await addOrUpdateWorkDay(workDay);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/");
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

const FilterSchema = z.object({
  query: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ActiveFilters = z.infer<typeof FilterSchema>;

// Ação otimizada que recebe os filtros em vez dos dados
export async function deleteFilteredWorkDaysAction(filters: ActiveFilters) {
    const validatedFilters = FilterSchema.parse(filters);
    const result = await deleteWorkDaysByFilter(validatedFilters);
    if (result.success) {
        revalidatePath("/gerenciamento");
        revalidatePath("/");
    }
    return result;
}

    