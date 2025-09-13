
'use server';

import { getFilteredAndGroupedWorkDays, generateCsvContent, WorkDay } from '@/services/work-day.service';
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
  const groupedWorkDays = await getFilteredAndGroupedWorkDays(userId, validatedFilters);
  
  // Extrai todos os WorkDay individuais dos grupos
  const allWorkDays: WorkDay[] = groupedWorkDays.flatMap(group => group.entries);
  
  const csvContent = await generateCsvContent(allWorkDays);
  return { csvContent };
}
