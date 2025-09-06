'use server';
/**
 * @fileOverview A flow for simulating a weekly data backup.
 *
 * - backupFlow - A Genkit flow that handles the backup process.
 * - BackupInput - The input type for the backup function.
 * - BackupOutput - The return type for the backup function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getWorkDays } from '@/services/work-day.service';
import { exportToCsvFlow } from './export-flow';
import { format } from 'date-fns';

const BackupInputSchema = z.object({
    backupEmail: z.string().email().describe('The email address to send the backup to.'),
});
export type BackupInput = z.infer<typeof BackupInputSchema>;

const BackupOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type BackupOutput = z.infer<typeof BackupOutputSchema>;

/**
 * A server action to securely call the Genkit flow for simulating a backup.
 */
export async function runBackupAction(input: BackupInput): Promise<BackupOutput> {
    const validatedInput = BackupInputSchema.parse(input);
    return await backupFlow(validatedInput);
}


const backupFlow = ai.defineFlow(
  {
    name: 'backupFlow',
    inputSchema: BackupInputSchema,
    outputSchema: BackupOutputSchema,
  },
  async ({ backupEmail }) => {
    
    const allWorkDays = await getWorkDays();
    if (allWorkDays.length === 0) {
      return { success: false, message: "Nenhum dado para fazer backup." };
    }

     const serializableWorkDays = allWorkDays.map(day => ({
      ...day,
      date: day.date.toISOString(),
      maintenance: {
        description: day.maintenanceEntries.map(m => m.description).join('; '),
        amount: day.maintenanceEntries.reduce((sum, m) => sum + m.amount, 0),
      }
    }));

    // Re-use the existing export flow to generate the CSV content
    const { csvContent } = await exportToCsvFlow(serializableWorkDays as any);

    const backupFileName = `Backup_UberCash_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    // Here you would typically use an email service (e.g., SendGrid, Resend)
    // For this simulation, we'll just log the action and return success.
    console.log(`SIMULATING BACKUP:`);
    console.log(`   Email: ${backupEmail}`);
    console.log(`   File: ${backupFileName}`);
    console.log(`   Content Length: ${csvContent.length} bytes`);
    
    // Simulate a delay as if sending an email
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      message: `Backup enviado com sucesso para ${backupEmail}!`,
    };
  }
);
