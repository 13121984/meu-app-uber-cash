
'use server';
/**
 * @fileOverview A flow for exporting report data to Google Sheets.
 *
 * - exportToSheetFlow - A Genkit flow that handles the export process.
 * - ExportToSheetInput - The input type for the exportToSheet function.
 * - ExportToSheetOutput - The return type for the exportToSheet function.
 */

import { ai } from '@/ai/genkit';
import { WorkDay } from '@/services/work-day.service';
import { google } from 'googleapis';
import { z } from 'zod';

const ExportToSheetInputSchema = z.array(z.custom<WorkDay>());
export type ExportToSheetInput = z.infer<typeof ExportToSheetInputSchema>;

const ExportToSheetOutputSchema = z.object({
  spreadsheetUrl: z.string().url(),
});
export type ExportToSheetOutput = z.infer<typeof ExportToSheetOutputSchema>;

// This is the Genkit flow definition. It is not exported directly to the client.
export const exportToSheetFlow = ai.defineFlow(
  {
    name: 'exportToSheetFlow',
    inputSchema: ExportToSheetInputSchema,
    outputSchema: ExportToSheetOutputSchema,
  },
  async (filteredWorkDays) => {
    
    if (!filteredWorkDays || filteredWorkDays.length === 0) {
      throw new Error("Nenhum dado para exportar com os filtros selecionados.");
    }
    
    // 1. Get authenticated Sheets API client from Genkit's context
    const sheets = google.sheets('v4');

    // 2. Prepare data for the spreadsheet
    const header = [
        "Data", "KM Rodados", "Horas", 
        "Lucro do Dia", "Ganhos (Bruto)", "Gastos (Combustível)",
        "Ganhos - Categoria", "Ganhos - Viagens", "Ganhos - Valor",
        "Abastecimento - Tipo", "Abastecimento - Valor Pago", "Abastecimento - Preço/Unid.",
        "Manutenção - Descrição", "Manutenção - Valor"
    ];
    
    const rows = filteredWorkDays.flatMap(day => {
        // As datas podem vir como strings, então garantimos que são objetos Date
        const dayDate = typeof day.date === 'string' || typeof day.date === 'number' ? new Date(day.date) : day.date;
        const profit = day.earnings.reduce((sum, e) => sum + e.amount, 0) - day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);

        const baseRow = [
            dayDate.toLocaleDateString('pt-BR'),
            day.km,
            day.hours,
            profit,
            day.earnings.reduce((sum, e) => sum + e.amount, 0),
            day.fuelEntries.reduce((sum, f) => sum + f.paid, 0),
        ];

        const maxRows = Math.max(day.earnings.length, day.fuelEntries.length, 1);
        const dayRows = [];

        for (let i = 0; i < maxRows; i++) {
            const earning = day.earnings[i] || {};
            const fuel = day.fuelEntries[i] || {};
            // A manutenção só aparece na primeira linha do dia
            const maintenance = i === 0 ? day.maintenance : {};

            dayRows.push([
                ...(i === 0 ? baseRow : Array(baseRow.length).fill('')),
                earning.category || '',
                earning.trips || '',
                earning.amount || '',
                fuel.type || '',
                fuel.paid || '',
                fuel.price || '',
                maintenance?.description || '',
                maintenance?.amount || ''
            ]);
        }
        return dayRows;
    });

    const values = [header, ...rows];

    // 3. Create the spreadsheet
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
    
    // 4. Add data to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Dados!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });

    // 5. Return the URL
    return {
      spreadsheetUrl: spreadsheet.data.spreadsheetUrl!,
    };
  }
);
