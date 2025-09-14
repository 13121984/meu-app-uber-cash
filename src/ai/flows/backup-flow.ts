
'use server';

/**
 * @fileOverview A flow for creating a data backup for a specific user.
 *
 * - runBackupFlow - A Genkit flow that handles the backup process.
 * - BackupOutput - The return type for the backup function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getWorkDays, generateCsvContent } from '@/services/work-day.service';
import { format } from 'date-fns';
import { saveBackupData } from '@/services/backup.service';

const BackupInputSchema = z.object({
    userId: z.string(),
});
export type BackupInput = z.infer<typeof BackupInputSchema>;

const BackupOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  backupDate: z.string().optional(),
});
export type BackupOutput = z.infer<typeof BackupOutputSchema>;

/**
 * A server action to securely call the Genkit flow for creating a backup.
 * This is now wrapped by a new action in gerenciamento/actions.ts
 */
export async function runBackupAction(input: BackupInput): Promise<BackupOutput> {
    const validatedInput = BackupInputSchema.parse(input);
    return await runBackupFlow(validatedInput);
}

const runBackupFlow = ai.defineFlow(
  {
    name: 'runBackupFlow',
    inputSchema: BackupInputSchema,
    outputSchema: BackupOutputSchema,
  },
  async ({ userId }) => {
    
    const allWorkDays = await getWorkDays(userId);
    if (allWorkDays.length === 0) {
      return { success: false, message: "Nenhum dado para fazer backup." };
    }

    // A função generateCsvContent já está no formato correto
    const csvContent = await generateCsvContent(allWorkDays);

    const now = new Date();
    const backupFileName = `Backup_UberCash_${format(now, 'yyyy-MM-dd_HH-mm')}.csv`;

    // Save the backup data to a user-specific file
    const saveResult = await saveBackupData(userId, {
      fileName: backupFileName,
      csvContent: csvContent,
    });

    if (!saveResult.success) {
      return { success: false, message: saveResult.error || "Falha ao salvar o arquivo de backup." };
    }
    
    return {
      success: true,
      message: `Backup criado com sucesso!`,
      backupDate: now.toISOString(),
    };
  }
);
