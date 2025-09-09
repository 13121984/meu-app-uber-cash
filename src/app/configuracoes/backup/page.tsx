
"use client";

import { BackupManager } from '@/components/configuracoes/backup-manager';
import { DatabaseBackup, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBackupData } from '@/services/backup.service';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import type { BackupData } from '@/services/backup.service';

export default function BackupPage() {
  const { user, loading } = useAuth();
  const [initialBackupData, setInitialBackupData] = useState<Omit<BackupData, 'csvContent'> | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (user) {
      setIsFetching(true);
      getBackupData(user.id).then(data => {
        setInitialBackupData(data);
        setIsFetching(false);
      });
    } else if (!loading) {
      // Handle case where user is not logged in
      setIsFetching(false);
    }
  }, [user, loading]);

  if (loading || isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Optionally, redirect or show a login message
    return <p>Por favor, faça login para acessar esta página.</p>;
  }

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
      
      {initialBackupData && <BackupManager initialBackupData={initialBackupData} />}
    </div>
  );
}
