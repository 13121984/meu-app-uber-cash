
'use server';

import { exportToCsvFlow, ExportToCsvOutput } from '@/ai/flows/export-flow';
import { getReportData, ReportData } from '@/services/summary.service';
import { z } from 'zod';
import type { DateRange } from "react-day-picker";
import { getWorkDaysForDate } from '@/services/work-day.service';

const ReportFilterValuesSchema = z.object({
    type: z.enum(['all', 'today', 'thisWeek', 'thisMonth', 'specificMonth', 'specificYear', 'custom']),
    year: z.number().optional(),
    month: z.number().optional(),
    dateRange: z.custom<DateRange>().optional(),
});
export type ReportFilterValues = z.infer<typeof ReportFilterValuesSchema>;

export async function exportReportAction(userId: string, filters: ReportFilterValues): Promise<ExportToCsvOutput> {
  const validatedFilters = ReportFilterValuesSchema.parse(filters);
  const reportData = await getReportData(userId, validatedFilters);
  
  // A ação agora usa a estrutura `rawWorkDays` que já tem tudo que precisamos
  const result = await exportToCsvFlow(reportData.rawWorkDays);
  return result;
}
