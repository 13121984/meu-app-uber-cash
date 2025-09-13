
"use client";

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Download, Loader2, CheckCircle, AlertTriangle, HardDriveUpload } from 'lucide-react';
import { runBackupFlow } from '@/app/configuracoes/backup/actions';
import type { BackupData } from '@/services/backup.service';
import { getBackupForDownload } from '@/services/backup.service';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth-context';

interface BackupManagerProps {
    initialBackupData: Omit<BackupData, 'csvContent'>;
}

export function BackupManager({ initialBackupData }: BackupManagerProps) {
  const { user } = useAuth();
  const [backupData, setBackupData] = useState(initialBackupData);
  const [isProcessing, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDateForDisplay = (dateString: string) => {
    if (!isClient) return ''; // Renderiza vazio no servidor para evitar mismatch
    if (!dateString) return "Data inválida";
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  }
  
  const handleGenerateBackup = () => {
    if(!user) return;
    startTransition(async () => {
        const result = await runBackupFlow({ userId: user.id });
        if (result.success && result.backupDate) {
            toast({
                title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Backup Criado!</span></div>,
                description: result.message,
            });
            // Update the state to reflect the new backup without a full page reload
            setBackupData({
                lastBackupDate: result.backupDate,
                fileName: `Backup_UberCash_${format(parseISO(result.backupDate), 'yyyy-MM-dd_HH-mm')}.csv`,
            });
        } else {
             toast({
                title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro no Backup</span></div>,
                description: result.message,
                variant: 'destructive'
            });
        }
    });
  }
  
  const handleDownloadBackup = () => {
      if(!user) return;
      startTransition(async () => {
          const result = await getBackupForDownload(user.id);
          if (result.success && result.csvContent && result.fileName) {
            const blob = new Blob([result.csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", result.fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
              toast({ title: "Erro ao baixar", description: result.error || "Não foi possível obter o arquivo de backup.", variant: 'destructive'});
          }
      });
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Backup Externo (CSV)</CardTitle>
                <CardDescription>
                    O sistema mantém apenas o backup mais recente. Gerar um novo backup irá sobrescrever o anterior.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-6 rounded-lg bg-secondary flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold">Último Backup</h3>
                        {backupData.lastBackupDate ? (
                            <p className="text-sm text-muted-foreground">
                                {formatDateForDisplay(backupData.lastBackupDate)}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhum backup foi gerado ainda.</p>
                        )}
                    </div>
                    {backupData.lastBackupDate && (
                        <Button onClick={handleDownloadBackup} variant="outline" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                            Baixar Último Backup
                        </Button>
                    )}
                </div>

                <Button onClick={handleGenerateBackup} size="lg" className="w-full" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <HardDriveUpload className="mr-2 h-4 w-4"/>}
                    {isProcessing ? 'Processando...' : 'Gerar Novo Backup CSV'}
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
