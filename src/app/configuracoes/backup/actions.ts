
'use server';

import { runBackupAction as serviceRunBackupAction } from "@/ai/flows/backup-flow";
import type { BackupInput, BackupOutput } from "@/ai/flows/backup-flow";
import { revalidatePath } from 'next/cache';

export async function runBackupFlow(input: BackupInput): Promise<BackupOutput> {
    const result = await serviceRunBackupAction(input);
    if (result.success) {
        revalidatePath('/configuracoes/backup');
    }
    return result;
}
