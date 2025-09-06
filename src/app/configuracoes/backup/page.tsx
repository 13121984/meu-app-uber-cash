
import { BackupManager } from '@/components/configuracoes/backup-manager';
import { DatabaseBackup } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getBackupData } from '@/services/backup.service';

export default async function BackupPage() {
  const initialBackupData = await getBackupData();
  
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <DatabaseBackup className="w-8 h-8 text-primary" />
            Backup e Restauração
          </h1>
          <p className="text-muted-foreground">Crie e baixe um ponto de restauração dos seus dados.</p>
        </div>
      </div>
      
      <BackupManager initialBackupData={initialBackupData} />
    </div>
  );
}
