
"use client";

import React, { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
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

import { Maintenance } from "@/services/maintenance.service";
import { MaintenanceForm } from "./maintenance-form";
import { ReportsFilter } from '@/components/relatorios/reports-filter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wrench, Trash2, Edit, DollarSign, Filter, Loader2, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { deleteMaintenanceAction, deleteAllMaintenanceAction, getFilteredMaintenanceRecordsAction } from '@/app/gerenciamento/actions';


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

const maintenanceTypeLabels = {
    preventive: { label: 'Preventiva', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    corrective: { label: 'Corretiva', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    both: { label: 'Ambas', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
};

export function MaintenanceClient() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentFilters, setCurrentFilters] = useState<ReportFilterValues | null>(null);

  const handleApplyFilters = useCallback((filters: ReportFilterValues) => {
    if (!user) return;
    setCurrentFilters(filters);
    startTransition(async () => {
      try {
        const data = await getFilteredMaintenanceRecordsAction(user.id, filters);
        setRecords(data);
      } catch (e) {
        toast({ title: "Erro ao buscar dados", variant: "destructive" });
      }
    });
  }, [user]);

  const filteredTotal = useMemo(() => {
    return records.reduce((sum, record) => sum + record.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);
  }, [records]);


  const handleSuccess = () => {
      setIsFormOpen(false);
      setSelectedRecord(null);
      if (currentFilters) {
        handleApplyFilters(currentFilters);
      }
  }

  const handleEdit = (record: Maintenance) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  }
  
  const handleDelete = async (id: string) => {
    if (!user) return;
    setIsDeleting(true);
    const result = await deleteMaintenanceAction(user.id, id);
    if(result.success) {
      toast({ title: "Sucesso!", description: "Registro apagado." });
      if (currentFilters) {
        handleApplyFilters(currentFilters);
      }
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsDeleting(false);
  }

  const handleDeleteAll = async () => {
    if (!user) return;
    setIsDeleting(true);
    const result = await deleteAllMaintenanceAction(user.id);
     if(result.success) {
      toast({ title: "Sucesso!", description: "Todos os registros foram apagados." });
      if (currentFilters) {
        handleApplyFilters(currentFilters);
      } else {
        setRecords([]);
      }
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsAlertOpen(false);
    setIsDeleting(false);
  }
  
  const renderContent = () => {
    if (isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!currentFilters) {
        return (
            <div className="text-center py-20 text-muted-foreground border-dashed border-2 rounded-lg mt-4">
                <Wrench className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">Selecione um período para começar</p>
                <p className="text-sm">Use os filtros acima para visualizar seus registros de manutenção.</p>
            </div>
        )
    }

    if (records.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground border-dashed border-2 rounded-lg mt-4">
                <Wrench className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">Nenhum registro de manutenção encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou adicione um novo registro.</p>
            </div>
        );
    }
    
    return (
      <div className="space-y-4 mt-4">
          <div className="pt-4 grid gap-4 md:grid-cols-2">
              <SummaryCard 
                  title="Total Gasto (Filtrado)"
                  value={formatCurrency(filteredTotal)}
                  description={`${records.length} ${records.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
                  icon={DollarSign}
                  iconClassName="text-red-500"
              />
              <SummaryCard 
                  title="Custo Médio (Filtrado)"
                  value={formatCurrency(records.length > 0 ? filteredTotal / records.length : 0)}
                  description={`Média por serviço no período`}
                  icon={Wrench}
                  iconClassName="text-orange-500"
              />
          </div>
          {records.map(record => {
             const typeInfo = maintenanceTypeLabels[record.type] || { label: 'N/A', className: '' };
             const totalAmount = record.items.reduce((sum, item) => sum + item.amount, 0);
             return (
              <Card key={record.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{record.description}</p>
                            <Badge variant="outline" className={cn(typeInfo.className)}>{typeInfo.label}</Badge>
                             <Badge variant="secondary" className="flex items-center gap-1"><Package className="h-3 w-3"/> {record.items.length} {record.items.length === 1 ? 'item' : 'itens'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                              {format(new Date(record.date), "dd/MM/yyyy (EEE)", { locale: ptBR })}
                          </p>
                      </div>
                      <div className="flex items-center gap-4">
                          <p className="font-semibold text-red-500">{formatCurrency(totalAmount)}</p>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(record)} disabled={isDeleting}>
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(record.id!)} disabled={isDeleting}>
                              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                      </div>
                  </CardContent>
              </Card>
             );
          })}
          {records.length > 0 && (
            <div className="pt-4 flex justify-end">
              <Button variant="destructive" onClick={() => setIsAlertOpen(true)} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Apagar Todos os Registros
              </Button>
            </div>
          )}
      </div>
    )
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
                    <Button onClick={() => setSelectedRecord(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Registro
                    </Button>
                </DialogTrigger>
            </CardHeader>
            <CardContent className="space-y-4">
                <ReportsFilter 
                    onApplyFilters={handleApplyFilters}
                    isPending={isPending}
                    reportData={null}
                    activeFilters={currentFilters}
                    chartRefs={{}}
                    plan={user?.plan || 'basic'}
                />
                {renderContent()}
            </CardContent>
        </Card>
        </div>
        <DialogContent className="max-w-3xl">
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
