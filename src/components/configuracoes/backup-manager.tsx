
"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Download, Loader2, CheckCircle, AlertTriangle, HardDriveUpload, History, UploadCloud, RefreshCw } from 'lucide-react';
import { runBackupAction } from '@/ai/flows/backup-flow';
import type { BackupData } from '@/services/backup.service';
import { getBackupForDownload, createRestorePoint, restoreFromPoint, getRestorePointData, type RestorePointData } from '@/services/backup.service';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface BackupManagerProps {
    initialBackupData: BackupData;
    initialRestorePointData: RestorePointData;
}

export function BackupManager({ initialBackupData, initialRestorePointData }: BackupManagerProps) {
  const [backupData, setBackupData] = useState(initialBackupData);
  const [restorePointData, setRestorePointData] = useState(initialRestorePointData);
  
  const [isProcessing, startTransition] = useTransition();
  const [isRestoring, startRestoreTransition] = useTransition();
  const [isCreatingRestorePoint, startCreateRestorePointTransition] = useTransition();

  const isAnyActionPending = isProcessing || isRestoring || isCreatingRestorePoint;

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Data inválida";
    try {
      // Using a locale-sensitive format that's robust
      return new Date(dateString).toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return "Data inválida";
    }
  }
  
  const handleGenerateBackup = () => {
    startTransition(async () => {
        const result = await runBackupAction();
        if (result.success && result.backupDate) {
            toast({
                title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Backup Criado!</span></div>,
                description: result.message,
            });
            // Update the state to reflect the new backup without a full page reload
            setBackupData({
                lastBackupDate: result.backupDate,
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
      startTransition(async () => {
          const result = await getBackupForDownload();
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

  const handleCreateRestorePoint = () => {
      startCreateRestorePointTransition(async () => {
          const result = await createRestorePoint();
           if (result.success) {
                toast({
                    title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Ponto de Restauração Criado!</span></div>,
                    description: "O estado atual dos seus dados foi salvo.",
                });
                setRestorePointData({ lastRestoreDate: result.date });
            } else {
                toast({
                    title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro</span></div>,
                    description: result.error || "Não foi possível criar o ponto de restauração.",
                    variant: 'destructive'
                });
            }
      });
  };

  const handleRestoreFromPoint = () => {
      startRestoreTransition(async () => {
          const result = await restoreFromPoint();
           if (result.success) {
                toast({
                    title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Dados Restaurados!</span></div>,
                    description: "Seus dados foram revertidos para o ponto de restauração salvo.",
                });
            } else {
                toast({
                    title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro na Restauração</span></div>,
                    description: result.error || "Não foi possível restaurar os dados.",
                    variant: 'destructive'
                });
            }
      })
  }
  
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Ponto de Restauração Interno
                </CardTitle>
                <CardDescription>
                    Crie um "snapshot" interno dos seus dados para poder reverter a um estado anterior. Esta ação sobrescreve o ponto anterior.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold">Último Ponto Salvo</h3>
                        {restorePointData.lastRestoreDate ? (
                            <p className="text-sm text-muted-foreground">
                                {formatDateForDisplay(restorePointData.lastRestoreDate)}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhum ponto de restauração foi criado ainda.</p>
                        )}
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleCreateRestorePoint} variant="outline" disabled={isAnyActionPending}>
                            {isCreatingRestorePoint ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                            {isCreatingRestorePoint ? 'Criando...' : 'Criar/Atualizar Ponto'}
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={!restorePointData.lastRestoreDate || isAnyActionPending}>
                                    {isRestoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                                    Restaurar Dados
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Todos os seus dados de trabalho e manutenção atuais serão **permanentemente apagados** e substituídos pelos dados do ponto de restauração.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRestoreFromPoint} className="bg-destructive hover:bg-destructive/80">
                                        Sim, restaurar agora
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>

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
                        <Button onClick={handleDownloadBackup} variant="outline" disabled={isAnyActionPending}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                            Baixar Último Backup
                        </Button>
                    )}
                </div>

                <Button onClick={handleGenerateBackup} size="lg" className="w-full" disabled={isAnyActionPending}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <HardDriveUpload className="mr-2 h-4 w-4"/>}
                    {isProcessing ? 'Processando...' : 'Gerar Novo Backup CSV'}
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
