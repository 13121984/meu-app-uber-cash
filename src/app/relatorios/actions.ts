
'use server';

import { ReportData, getReportData } from '@/services/summary.service';
import { z } from 'zod';
import type { DateRange } from "react-day-picker";
import { getWorkDaysForDate, generateCsvContent } from '@/services/work-day.service';

const ReportFilterValuesSchema = z.object({
    type: z.enum(['all', 'today', 'thisWeek', 'thisMonth', 'specificMonth', 'specificYear', 'custom']),
    year: z.number().optional(),
    month: z.number().optional(),
    dateRange: z.custom<DateRange>().optional(),
});
export type ReportFilterValues = z.infer<typeof ReportFilterValuesSchema>;

export async function exportReportAction(userId: string, filters: ReportFilterValues): Promise<{csvContent: string}> {
  const validatedFilters = ReportFilterValuesSchema.parse(filters);
  const reportData = await getReportData(userId, validatedFilters);
  
  // Ação agora usa a estrutura `rawWorkDays` que já tem tudo que precisamos
  const csvContent = await generateCsvContent(reportData.rawWorkDays);
  return { csvContent };
}
