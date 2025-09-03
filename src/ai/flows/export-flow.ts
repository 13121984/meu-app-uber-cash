
'use server';
/**
 * @fileOverview A flow for exporting report data to Google Sheets.
 *
 * - exportToSheet - A function that handles the export process.
 * - ExportToSheetInput - The input type for the exportToSheet function.
 * - ExportToSheetOutput - The return type for the exportToSheet function.
 */

import { ai } from '@/ai/genkit';
import { getReportData, WorkDay, Earning, FuelEntry } from '@/services/work-day.service';
import { ReportFilterValuesSchema } from '@/components/relatorios/reports-filter';
import { google } from 'googleapis';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const ExportToSheetInputSchema = z.object({
  filters: ReportFilterValuesSchema,
});
export type ExportToSheetInput = z.infer<typeof ExportToSheetInputSchema>;

const ExportToSheetOutputSchema = z.object({
  spreadsheetUrl: z.string().url(),
});
export type ExportToSheetOutput = z.infer<typeof ExportToSheetOutputSchema>;


// Wrapper function to be called from the client
export async function exportToSheet(input: ExportToSheetInput): Promise<ExportToSheetOutput> {
  const result = await exportToSheetFlow(input);
  revalidatePath('/relatorios');
  return result;
}

const exportToSheetFlow = ai.defineFlow(
  {
    name: 'exportToSheetFlow',
    inputSchema: ExportToSheetInputSchema,
    outputSchema: ExportToSheetOutputSchema,
  },
  async ({ filters }) => {
    // 1. Fetch all workdays (this is inefficient, but our service is structured this way)
    const allWorkDays = await getReportData([], { type: 'all' }).then(d => d.rawWorkDays);
    
    // 2. Filter the workdays based on the provided filters
    const { rawWorkDays: filteredWorkDays } = await getReportData(allWorkDays, filters);

    if (!filteredWorkDays || filteredWorkDays.length === 0) {
      throw new Error("Nenhum dado para exportar com os filtros selecionados.");
    }
    
    // 3. Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      // Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 4. Prepare data for the spreadsheet
    const header = [
        "Data", "KM Rodados", "Horas", 
        "Lucro do Dia", "Ganhos (Bruto)", "Gastos (Combustível)",
        "Ganhos - Categoria", "Ganhos - Viagens", "Ganhos - Valor",
        "Abastecimento - Tipo", "Abastecimento - Valor Pago", "Abastecimento - Preço/Unid.",
        "Manutenção - Descrição", "Manutenção - Valor"
    ];
    
    const rows = filteredWorkDays.flatMap(day => {
        const baseRow = [
            day.date.toLocaleDateString('pt-BR'),
            day.km,
            day.hours,
            day.earnings.reduce((sum, e) => sum + e.amount, 0) - day.fuelEntries.reduce((sum, f) => sum + f.paid, 0),
            day.earnings.reduce((sum, e) => sum + e.amount, 0),
            day.fuelEntries.reduce((sum, f) => sum + f.paid, 0),
        ];

        const maxRows = Math.max(day.earnings.length, day.fuelEntries.length, 1);
        const dayRows = [];

        for (let i = 0; i < maxRows; i++) {
            const earning = day.earnings[i] || {};
            const fuel = day.fuelEntries[i] || {};
            const maintenance = i === 0 ? day.maintenance : {};

            dayRows.push([
                ...(i === 0 ? baseRow : Array(baseRow.length).fill('')),
                earning.category || '',
                earning.trips || '',
                earning.amount || '',
                fuel.type || '',
                fuel.paid || '',
                fuel.price || '',
                maintenance.description || '',
                maintenance.amount || ''
            ]);
        }
        return dayRows;
    });

    const values = [header, ...rows];

    // 5. Create the spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Relatório Rota Certa - ${new Date().toLocaleString('pt-BR')}`,
        },
        sheets: [{
          properties: { title: 'Dados' },
        }],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error("Falha ao criar a planilha.");
    }
    
    // 6. Add data to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Dados!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });

    // 7. Return the URL
    return {
      spreadsheetUrl: spreadsheet.data.spreadsheetUrl!,
    };
  }
);
