
"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Download, Loader2, CheckCircle, AlertTriangle, HardDriveUpload } from 'lucide-react';
import { runBackupAction } from '@/ai/flows/backup-flow';
import type { BackupData } from '@/services/backup.service';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupManagerProps {
    initialBackupData: BackupData;
}

export function BackupManager({ initialBackupData }: BackupManagerProps) {
  const [backupData, setBackupData] = useState(initialBackupData);
  const [isGenerating, startGenerationTransition] = useTransition();
  
  const handleGenerateBackup = () => {
    startGenerationTransition(async () => {
        const result = await runBackupAction();
        if (result.success && result.backupDate) {
            toast({
                title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Backup Criado!</span></div>,
                description: result.message,
            });
            // Update the state to reflect the new backup without a full page reload
            setBackupData({
                lastBackupDate: result.backupDate,
                // These will be filled by the download function, but let's be optimistic
                fileName: `Backup_UberCash_${format(parseISO(result.backupDate), 'yyyy-MM-dd_HH-mm')}.csv`,
                csvContent: '' // We don't need the content on the client until download
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
      // The backup data is stored on the server, we need to fetch it again for download
      // Or, ideally, the server action would return the content. For now, let's keep it simple.
      // We will re-run the export flow to get the content for download.
      // This is slightly inefficient but ensures the data is always the latest.
      startGenerationTransition(async () => {
          const { success, csvContent, fileName } = await getBackupForDownload();
          if (success && csvContent && fileName) {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
              toast({ title: "Erro ao baixar", description: "Não foi possível obter o arquivo de backup.", variant: 'destructive'});
          }
      });
  }

  // A helper server action to get the backup content for download
  async function getBackupForDownload() {
      const { getBackupData } = await import('@/services/backup.service');
      return getBackupData();
  }
  
  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">Gerenciador de Backup</CardTitle>
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
                            {format(parseISO(backupData.lastBackupDate), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhum backup foi gerado ainda.</p>
                    )}
                </div>
                {backupData.lastBackupDate && (
                    <Button onClick={handleDownloadBackup} variant="outline" disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                        Baixar Último Backup
                    </Button>
                )}
            </div>

            <Button onClick={handleGenerateBackup} size="lg" className="w-full">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <HardDriveUpload className="mr-2 h-4 w-4"/>}
                Gerar Novo Backup Agora
            </Button>
        </CardContent>
    </Card>
  );
}
