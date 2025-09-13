
'use server';

import { revalidatePath } from 'next/cache';
import { runBackupFlow as serviceRunBackupFlow } from '@/services/backup.service';
import type { BackupInput, BackupOutput } from '@/services/backup.service';

export async function runBackupFlowAction(input: BackupInput): Promise<BackupOutput> {
    const result = await serviceRunBackupFlow(input);
    if (result.success) {
        revalidatePath('/configuracoes/backup');
    }
    return result;
}
