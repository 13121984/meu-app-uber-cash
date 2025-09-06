
"use client";

import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import { ReportsFilter } from "@/components/relatorios/reports-filter";
import { Button } from "../ui/button";
import { Loader2, Trash2, History } from "lucide-react";
import { deleteFilteredWorkDaysAction, ActiveFilters } from "./actions";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { getFilteredWorkDays, type WorkDay } from '@/services/work-day.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';

export interface GroupedWorkDay {
  date: Date;
  totalProfit: number;
  totalHours: number;
  totalKm: number;
  entries: WorkDay[];
}

export function GerenciamentoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { columns, Dialogs, setEditingDay } = useWorkDayColumns();

  const [isDeletingFiltered, startDeleteTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [groupedWorkDays, setGroupedWorkDays] = useState<GroupedWorkDay[]>([]);
  const [currentFilters, setCurrentFilters] = useState<ReportFilterValues | null>(null);

  const handleApplyFilters = useCallback((filters: ReportFilterValues) => {
    setCurrentFilters(filters);
    startTransition(async () => {
      try {
        const filtered = await getFilteredWorkDays(filters);
        setGroupedWorkDays(filtered);
      } catch (e) {
        console.error("Failed to fetch work days", e);
        toast({ title: "Erro ao buscar dados", description: "Não foi possível carregar os registros.", variant: "destructive" });
      }
    });
  }, []);

  const filteredCount = groupedWorkDays.reduce((acc, day) => acc + day.entries.length, 0);

  const handleDeleteFiltered = async () => {
    if (!currentFilters) return;

    startDeleteTransition(async () => {
      try {
          const result = await deleteFilteredWorkDaysAction(currentFilters as ActiveFilters);
          if (result.success) {
              toast({ title: "Sucesso!", description: `${result.count || 0} registros apagados.` });
              handleApplyFilters(currentFilters); // Refresh the data
          } else {
              toast({ title: "Erro!", description: result.error, variant: "destructive" });
          }
      } catch (error) {
          toast({ title: "Erro Inesperado!", description: "Ocorreu um erro ao apagar os registros.", variant: "destructive" });
      } finally {
          setIsAlertOpen(false);
      }
    });
  };
  
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
                <History className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">Selecione um período para começar</p>
                <p className="text-sm">Use os filtros acima para visualizar seus registros.</p>
            </div>
         )
     }

      return (
         <div className="mt-4 space-y-4">
              {filteredCount > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsAlertOpen(true)}
                    disabled={isDeletingFiltered}
                  >
                    {isDeletingFiltered ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Apagar {filteredCount} {filteredCount === 1 ? 'Registro Filtrado' : 'Registros Filtrados'}
                  </Button>
                </div>
              )}
            <DataTable 
              columns={columns} 
              data={groupedWorkDays}
              onRowClick={(row) => setEditingDay(row.original)} 
            />
         </div>
      );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Seus Registros</CardTitle>
          <CardDescription>
            Use os filtros para encontrar e gerenciar seus dias de trabalho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsFilter 
            onApplyFilters={handleApplyFilters}
            isPending={isPending}
          />
          {renderContent()}
        </CardContent>
      </Card>

      {Dialogs}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente os <b>{filteredCount}</b> registros de trabalho que correspondem aos filtros atuais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFiltered} disabled={isDeletingFiltered} className="bg-destructive hover:bg-destructive/90">
              {isDeletingFiltered ? "Apagando..." : "Sim, apagar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
