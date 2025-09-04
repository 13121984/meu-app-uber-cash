
'use server';

import { exportToSheetFlow, ExportToSheetOutput } from '@/ai/flows/export-flow';
import { getReportData } from '@/services/work-day.service';
import { z } from 'zod';
import type { DateRange } from "react-day-picker";

// Define the schema and type here in the server file, but do not export them.
const ReportFilterValuesSchema = z.object({
    type: z.enum(['all', 'today', 'thisWeek', 'thisMonth', 'specificMonth', 'specificYear', 'custom']),
    year: z.number().optional(),
    month: z.number().optional(),
    dateRange: z.custom<DateRange>().optional(),
});
export type ReportFilterValues = z.infer<typeof ReportFilterValuesSchema>;


/**
 * A Server Action to securely call the Genkit flow for exporting reports.
 * This function is called from the client-side component.
 */
export async function exportReportAction(filters: ReportFilterValues): Promise<ExportToSheetOutput> {
  // Validate the filters to ensure they are in the expected format.
  const validatedFilters = ReportFilterValuesSchema.parse(filters);

  // Fetch the filtered data on the server.
  // We pass an empty array for `allWorkDays` because getReportData
  // will fetch all days if the array is empty.
  const { rawWorkDays } = await getReportData([], validatedFilters);
  
  // The rawWorkDays might contain Date objects, which are not directly serializable
  // by Genkit flows if they are not defined in the Zod schema. 
  // We'll convert dates to ISO strings before passing them to the flow.
  const serializableWorkDays = rawWorkDays.map(day => ({
      ...day,
      date: day.date.toISOString(),
  }));

  // Call the Genkit flow with the filtered and serialized data.
  // The custom Zod schema in the flow will handle the conversion back if needed,
  // though for this specific flow, we just need to display it.
  const result = await exportToSheetFlow(serializableWorkDays as any);

  return result;
}
