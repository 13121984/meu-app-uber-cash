'use server';
/**
 * @fileOverview An intelligent CSV importer flow.
 *
 * - intelligentImporterFlow - A Genkit flow that processes a flexible-format CSV and transforms it into the application's standard import format.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the input schema for the flow, which is the raw CSV content.
const IntelligentImporterInputSchema = z.object({
  csvContent: z.string().describe("The raw content of the user's uploaded CSV file."),
});
export type IntelligentImporterInput = z.infer<typeof IntelligentImporterInputSchema>;

// Define the output schema, which will be the cleaned and transformed CSV content.
const IntelligentImporterOutputSchema = z.object({
  processedCsv: z.string().describe("The processed CSV content, formatted to match the application's required import structure."),
});
export type IntelligentImporterOutput = z.infer<typeof IntelligentImporterOutputSchema>;

/**
 * A server action to securely call the Genkit flow for intelligent CSV processing.
 * This will be called from the client-side component.
 */
export async function runIntelligentImportAction(input: IntelligentImporterInput): Promise<IntelligentImporterOutput> {
  return await intelligentImporterFlow(input);
}


// Define the prompt for the AI model.
const intelligentImportPrompt = ai.definePrompt({
    name: 'intelligentImportPrompt',
    input: { schema: IntelligentImporterInputSchema },
    output: { schema: IntelligentImporterOutputSchema },
    prompt: `You are an expert data processor. Your task is to transform a raw CSV file from a user into a standardized format.

    The user's CSV has a "wide" format, with earnings and fuel expenses spread across multiple columns. The target format is a "long" format, where each earning and fuel entry is on its own row, sharing a common date.

    **User's CSV Format (Example):**
    - Data: Date of the workday (DD/MM/YY).
    - Ganhos (Earnings): Columns like "99Pop R$", "Ubex R$", "Particular R$" with monetary values. Each might have an adjacent "Viagens" (Trips) column.
    - Gastos (Expenses): Columns like "GNV", "Etanol" for the amount paid. Each might have an adjacent price column like "R$ Mt3" or "R$ Lt".
    - Informações (Info): Columns like "Kms Percorridos" and "Horas Trabalhadas".

    **Target CSV Format (Required):**
    The output MUST be a CSV string with the following exact headers in the first line:
    'date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount'

    **Transformation Rules:**
    1.  **Date:** Convert the date from DD/MM/YY to YYYY-MM-DD.
    2.  **Combine Rows:** For each date in the input, create multiple rows in the output. The first row for a given date contains the main info (date, km, hours). Subsequent rows for the same date will have these fields empty.
    3.  **Earnings:** For each earning column in a user's row (e.g., "99Pop R$"), create a new row in the output.
        -   'earnings_category': The name of the category (e.g., "99 Pop"). Clean up the name from the header (remove "R$").
        -   'earnings_trips': The value from the corresponding "Viagens" column. If none, use 0.
        -   'earnings_amount': The monetary value.
    4.  **Fuel:** For each fuel column (e.g., "GNV"), create a new row in the output.
        -   'fuel_type': The name of the fuel (e.g., "GNV").
        -   'fuel_paid': The monetary value.
        -   'fuel_price': The value from the corresponding price column (e.g., "R$ Mt3").
    5.  **KM and Hours:**
        -   'km': The value from "Kms Percorridos".
        -   'hours': Convert time format (like "6:20:00" or "8:55") into a decimal number (e.g., "6:30" becomes 6.5).
    6.  **Data Cleaning:**
        -   Remove "R$" symbols.
        -   Convert comma decimal separators (e.g., "77,19") to dots ("77.19").
        -   If a value is empty, leave the corresponding cell in the output CSV empty.
    7.  **Maintenance:** The user's format doesn't have maintenance. Leave 'maintenance_description' and 'maintenance_amount' columns empty.
    8.  **Structure:** Create one row for each earning and each fuel entry for a given day. The 'date', 'km', and 'hours' fields should only appear on the first entry for that day.

    Here is the user's CSV content to process:
    \`\`\`csv
    {{{csvContent}}}
    \`\`\`

    Process the entire CSV and return the result in the 'processedCsv' field.
    `,
});


// Define the Genkit flow.
export const intelligentImporterFlow = ai.defineFlow(
  {
    name: 'intelligentImporterFlow',
    inputSchema: IntelligentImporterInputSchema,
    outputSchema: IntelligentImporterOutputSchema,
  },
  async (input) => {
    // Call the AI model with the defined prompt and the input CSV content.
    const { output } = await intelligentImportPrompt(input);
    
    // The output will be automatically validated against the IntelligentImporterOutputSchema.
    // We can be confident that output.processedCsv is a string.
    return output!;
  }
);
