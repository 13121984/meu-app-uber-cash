
'use server';

import { getWorkDays, getFilteredWorkDays, generateCsvContent, WorkDay } from '@/services/work-day.service';
import { z } from 'zod';
import type { DateRange } from "react-day-picker";

const ReportFilterValuesSchema = z.object({
    type: z.enum(['all', 'today', 'thisWeek', 'thisMonth', 'specificMonth', 'specificYear', 'custom']),
    year: z.number().optional(),
    month: z.number().optional(),
    dateRange: z.custom<DateRange>().optional(),
});
export type ReportFilterValues = z.infer<typeof ReportFilterValuesSchema>;

export async function exportReportAction(userId: string, filters: ReportFilterValues): Promise<{csvContent: string}> {
  const validatedFilters = ReportFilterValuesSchema.parse(filters);
  
  // Etapa 1: Obter todos os dias de trabalho
  const allWorkDaysRaw = await getWorkDays(userId);
  
  // Etapa 2: Filtrar os dias com base nos filtros fornecidos
  const filteredWorkDays = await getFilteredWorkDays(allWorkDaysRaw, validatedFilters);

  // Etapa 3: Gerar o conteúdo CSV a partir dos dias filtrados
  const csvContent = await generateCsvContent(filteredWorkDays);

  return { csvContent };
}
