

"use server"

import { revalidatePath } from "next/cache";
import { deleteWorkDaysByFilter, addOrUpdateWorkDay, deleteWorkDayEntry } from "@/services/work-day.service";
import type { WorkDay } from "@/services/work-day.service";
import type { ReportFilterValues } from "@/app/relatorios/actions";

// A atualização de resumos será tratada de outra forma para evitar ciclos de dependência.
// Esta camada deve focar apenas na sua responsabilidade: interagir com 'work-day.service'.

export async function updateWorkDayAction(userId: string, workDay: WorkDay) {
    const result = await addOrUpdateWorkDay(userId, workDay);
    if (result.success) {
        // A revalidação é suficiente para que as páginas busquem os dados atualizados.
        revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteWorkDayEntryAction(userId: string, workDayId: string) {
    const result = await deleteWorkDayEntry(userId, workDayId);
    if (result.success) {
         revalidatePath('/', 'layout');
    }
    return result;
}

export async function deleteFilteredWorkDaysAction(userId: string, filters: ReportFilterValues) {
    const result = await deleteWorkDaysByFilter(userId, filters);
    if (result.success) {
         revalidatePath('/', 'layout');
    }
    return result;
}
