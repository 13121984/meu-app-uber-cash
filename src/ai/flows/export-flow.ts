
'use server';
/**
 * @fileOverview A flow for exporting report data to a CSV file.
 *
 * - exportToCsvFlow - A Genkit flow that handles the CSV generation.
 * - ExportToCsvInput - The input type for the exportToCsv function.
 * - ExportToCsvOutput - The return type for the exportToCsv function.
 */

import { ai } from '@/ai/genkit';
import { WorkDay } from '@/services/work-day.service';
import { z } from 'zod';
import { format } from 'date-fns';

const ExportToCsvInputSchema = z.array(z.custom<WorkDay>());
export type ExportToCsvInput = z.infer<typeof ExportToCsvInputSchema>;

const ExportToCsvOutputSchema = z.object({
  csvContent: z.string(),
});
export type ExportToCsvOutput = z.infer<typeof ExportToCsvOutputSchema>;

// Headers for the CSV file, matching the import structure
const CSV_HEADERS = [
    'date', 'km', 'hours',
    'earnings_category', 'earnings_trips', 'earnings_amount',
    'fuel_type', 'fuel_paid', 'fuel_price',
    'maintenance_description', 'maintenance_amount'
];


function escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    // If the value contains a comma, quote, or newline, enclose it in double quotes
    if (/[",\r\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}


export const exportToCsvFlow = ai.defineFlow(
  {
    name: 'exportToCsvFlow',
    inputSchema: ExportToCsvInputSchema,
    outputSchema: ExportToCsvOutputSchema,
  },
  async (filteredWorkDays) => {
    
    if (!filteredWorkDays || filteredWorkDays.length === 0) {
      throw new Error("Nenhum dado para exportar com os filtros selecionados.");
    }

    const rows: string[][] = [];

    // Flatten the work day data into a structure suitable for CSV
    filteredWorkDays.forEach(day => {
        const dateStr = format(new Date(day.date), 'yyyy-MM-dd');
        
        // Handle days with no entries, just basic info
        if (day.earnings.length === 0 && day.fuelEntries.length === 0 && (!day.maintenance || day.maintenance.amount === 0)) {
             rows.push([
                dateStr,
                escapeCsvValue(day.km),
                escapeCsvValue(day.hours),
                '', '', '', '', '', '', '', ''
            ]);
            return;
        }

        const maxEntries = Math.max(day.earnings.length, day.fuelEntries.length, (day.maintenance && day.maintenance.amount > 0) ? 1 : 0);

        for (let i = 0; i < maxEntries; i++) {
            const earning = day.earnings[i];
            const fuel = day.fuelEntries[i];
            // Maintenance should only be on the first row for a given day
            const maintenance = (i === 0 && day.maintenance && day.maintenance.amount > 0) ? day.maintenance : null;
            // Basic info (date, km, hours) should only be on the first row for a given day
            const isFirstRowOfDay = (i === 0);

            rows.push([
                isFirstRowOfDay ? dateStr : '',
                isFirstRowOfDay ? escapeCsvValue(day.km) : '',
                isFirstRowOfDay ? escapeCsvValue(day.hours) : '',
                earning ? escapeCsvValue(earning.category) : '',
                earning ? escapeCsvValue(earning.trips) : '',
                earning ? escapeCsvValue(earning.amount) : '',
                fuel ? escapeCsvValue(fuel.type) : '',
                fuel ? escapeCsvValue(fuel.paid) : '',
                fuel ? escapeCsvValue(fuel.price) : '',
                maintenance ? escapeCsvValue(maintenance.description) : '',
                maintenance ? escapeCsvValue(maintenance.amount) : ''
            ]);
        }
    });

    // Convert rows to CSV string
    const csvContent = [
        CSV_HEADERS.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return {
      csvContent,
    };
  }
);
