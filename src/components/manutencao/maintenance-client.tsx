
"use client";

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Maintenance, deleteMaintenance, deleteAllMaintenance } from "@/services/maintenance.service";
import { MaintenanceForm } from "./maintenance-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wrench, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


interface MaintenanceClientProps {
  initialRecords: Maintenance[];
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function MaintenanceClient({ initialRecords }: MaintenanceClientProps) {
  const [records, setRecords] = useState(initialRecords);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(null);
  
  // Atualiza os registros localmente quando o formulário é submetido com sucesso
  const handleSuccess = (newRecord: Maintenance) => {
      if (selectedRecord) {
        // Editando
        setRecords(records.map(r => r.id === newRecord.id ? newRecord : r));
      } else {
        // Adicionando
        setRecords([newRecord, ...records]);
      }
      setIsFormOpen(false);
      setSelectedRecord(null);
  }

  const handleEdit = (record: Maintenance) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  }
  
  const handleDelete = async (id: string) => {
    const result = await deleteMaintenance(id);
    if(result.success) {
      setRecords(records.filter(r => r.id !== id));
      toast({ title: "Sucesso!", description: "Registro apagado." });
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
  }

  const handleDeleteAll = async () => {
    const result = await deleteAllMaintenance();
     if(result.success) {
      setRecords([]);
      toast({ title: "Sucesso!", description: "Todos os registros foram apagados." });
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsAlertOpen(false);
  }

  const monthlyAverage = useMemo(() => {
    if (records.length === 0) return 0;
    const totalSpent = records.reduce((sum, record) => sum + record.amount, 0);
    const months = new Set(records.map(r => format(r.date, 'yyyy-MM')));
    return totalSpent / months.size;
  }, [records]);

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if(!open) setSelectedRecord(null);
    }}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-lg">Histórico de Manutenção</CardTitle>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        Média Mensal: <span className="font-bold text-foreground">{formatCurrency(monthlyAverage)}</span>
                    </p>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Registro
                        </Button>
                    </DialogTrigger>
                </div>
            </CardHeader>
            <CardContent>
                {records.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Wrench className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-semibold">Nenhum registro de manutenção ainda</p>
                    <p className="text-sm">Clique em "Adicionar Registro" para começar.</p>
                </div>
                ) : (
                <div className="space-y-4">
                    {records.map(record => (
                    <Card key={record.id} className="bg-secondary/50">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 space-y-1">
                                <p className="font-bold">{record.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(record.date, "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="font-semibold text-red-500">{formatCurrency(record.amount)}</p>
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(record)}>
                                   <Edit className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(record.id!)}>
                                   <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                    {records.length > 0 && (
                      <div className="pt-4 flex justify-end">
                        <Button variant="destructive" onClick={() => setIsAlertOpen(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Apagar Tudo
                        </Button>
                      </div>
                    )}
                </div>
                )}
            </CardContent>
        </Card>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedRecord ? 'Editar' : 'Adicionar'} Registro de Manutenção</DialogTitle>
                <DialogDescription>
                    Preencha os detalhes do serviço de manutenção realizado.
                </DialogDescription>
            </DialogHeader>
            <MaintenanceForm 
                onSuccess={handleSuccess} 
                initialData={selectedRecord}
            />
        </DialogContent>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso irá apagar permanentemente todos os seus registros de manutenção.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">Apagar Tudo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </Dialog>
  );
}
