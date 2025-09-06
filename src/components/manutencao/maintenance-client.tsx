
"use client";

import React, { useState, useMemo } from 'react';
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
import { MaintenanceFilters } from './maintenance-filters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wrench, Trash2, Edit, DollarSign, Filter, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SummaryCard = ({ title, value, description, icon: Icon, iconClassName }: { title: string; value: string; description: string; icon: React.ElementType, iconClassName?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${iconClassName}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

interface MaintenanceClientProps {
    allRecords: Maintenance[];
}

export function MaintenanceClient({ allRecords: filteredRecords }: MaintenanceClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(null);

  const filteredTotal = useMemo(() => {
    return filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  }, [filteredRecords]);


  const handleSuccess = () => {
      setIsFormOpen(false);
      setSelectedRecord(null);
      router.refresh(); // Re-fetches data from server
  }

  const handleEdit = (record: Maintenance) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  }
  
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deleteMaintenance(id);
    if(result.success) {
      toast({ title: "Sucesso!", description: "Registro apagado." });
      router.refresh();
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsDeleting(false);
  }

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    const result = await deleteAllMaintenance();
     if(result.success) {
      toast({ title: "Sucesso!", description: "Todos os registros foram apagados." });
      router.refresh();
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsAlertOpen(false);
    setIsDeleting(false);
  }


  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if(!open) setSelectedRecord(null);
    }}>
      <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Histórico de Manutenção
                </CardTitle>
                 <CardDescription>
                    Filtre e gerencie seus registros de manutenção.
                 </CardDescription>
              </div>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Registro
                    </Button>
                </DialogTrigger>
            </CardHeader>
            <CardContent className="space-y-4">
                <MaintenanceFilters />

                <div className="pt-4 grid gap-4 md:grid-cols-2">
                    <SummaryCard 
                        title="Total Gasto (Filtrado)"
                        value={formatCurrency(filteredTotal)}
                        description={`${filteredRecords.length} ${filteredRecords.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
                        icon={DollarSign}
                        iconClassName="text-red-500"
                    />
                     <SummaryCard 
                        title="Custo Médio (Filtrado)"
                        value={formatCurrency(filteredRecords.length > 0 ? filteredTotal / filteredRecords.length : 0)}
                        description={`Média por serviço no período`}
                        icon={Wrench}
                        iconClassName="text-orange-500"
                    />
                </div>

                {filteredRecords.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border-dashed border-2 rounded-lg mt-4">
                    <Wrench className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-semibold">Nenhum registro de manutenção encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros ou adicione um novo registro.</p>
                </div>
                ) : (
                <div className="space-y-4 mt-4">
                    {filteredRecords.map(record => (
                    <Card key={record.id}>
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 space-y-1">
                                <p className="font-bold">{record.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(record.date), "dd/MM/yyyy (EEE)", { locale: ptBR })}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="font-semibold text-red-500">{formatCurrency(record.amount)}</p>
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(record)} disabled={isDeleting}>
                                   <Edit className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(record.id!)} disabled={isDeleting}>
                                   {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                               </Button>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                    {filteredRecords.length > 0 && (
                      <div className="pt-4 flex justify-end">
                        <Button variant="destructive" onClick={() => setIsAlertOpen(true)} disabled={isDeleting}>
                           {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Apagar Todos os Registros
                        </Button>
                      </div>
                    )}
                </div>
                )}
            </CardContent>
        </Card>
        </div>
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
                Esta ação não pode ser desfeita. Isso irá apagar permanentemente TODOS os seus registros de manutenção.
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
