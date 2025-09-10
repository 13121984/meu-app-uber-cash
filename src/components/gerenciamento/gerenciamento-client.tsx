

"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import { HistoryFilters } from "./history-filters";
import { Button } from "../ui/button";
import { Loader2, Trash2, History, BarChart3, Smartphone } from "lucide-react";
import { deleteFilteredWorkDaysAction } from "./actions";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { getFilteredAndGroupedWorkDays, type WorkDay } from '@/services/work-day.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";


export interface GroupedWorkDay {
  date: Date;
  totalProfit: number;
  totalHours: number;
  totalKm: number;
  entries: WorkDay[];
}

export function GerenciamentoClient() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { columns, Dialogs, setEditingDay } = useWorkDayColumns();

  const [isDeletingFiltered, startDeleteTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [groupedWorkDays, setGroupedWorkDays] = useState<GroupedWorkDay[]>([]);
  const [currentFilters, setCurrentFilters] = useState<ReportFilterValues | null>(null);

  const handleApplyFilters = useCallback((filters: ReportFilterValues) => {
    if (!user) return;
    
    // Update URL with new filters
    const params = new URLSearchParams();
    params.set('period', filters.type);
    if(filters.year) params.set('year', filters.year.toString());
    if(filters.month !== undefined) params.set('month', filters.month.toString());
    if(filters.dateRange?.from) params.set('from', filters.dateRange.from.toISOString());
    if(filters.dateRange?.to) params.set('to', filters.dateRange.to.toISOString());
    router.replace(`/gerenciamento?${params.toString()}`);
    
    setCurrentFilters(filters);
    startTransition(async () => {
      try {
        const filtered = await getFilteredAndGroupedWorkDays(user.id, filters);
        setGroupedWorkDays(filtered);
      } catch (e) {
        console.error("Failed to fetch work days", e);
        toast({ title: "Erro ao buscar dados", description: "Não foi possível carregar os registros.", variant: "destructive" });
      }
    });
  }, [user, router]);
  
  // Effect to read filters from URL on initial load or on back/forward navigation
  useEffect(() => {
    const period = searchParams.get('period');
    
    if (period) {
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const filtersFromUrl: ReportFilterValues = { type: period as any };
        if (year) filtersFromUrl.year = parseInt(year);
        if (month) filtersFromUrl.month = parseInt(month);
        if (from) {
            filtersFromUrl.dateRange = { from: new Date(from), to: to ? new Date(to) : undefined };
        }
        
        // This check prevents an infinite loop.
        // It only applies filters if the component hasn't been initialized with filters yet.
        if (!currentFilters) {
            handleApplyFilters(filtersFromUrl);
        }
    }
  }, [searchParams, handleApplyFilters, currentFilters]);


  const filteredCount = groupedWorkDays.reduce((acc, day) => acc + day.entries.length, 0);

  const handleDeleteFiltered = async () => {
    if (!currentFilters || !user) return;

    startDeleteTransition(async () => {
      try {
          const result = await deleteFilteredWorkDaysAction(user.id, currentFilters);
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

  if (!user) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Seus Registros</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <CardDescription>
                Use os filtros para encontrar e gerenciar seus dias de trabalho.
            </CardDescription>
             <Link href={`/relatorios?${searchParams.toString()}`}>
                <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Relatórios
                </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <HistoryFilters 
            isPending={isPending}
            onFiltersChange={handleApplyFilters}
          />
          {renderContent()}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Visão de Futuro: Registro Simplificado
          </CardTitle>
           <CardDescription>
                Saiba mais sobre nosso futuro recurso de registro de corridas com um toque (Em breve).
            </CardDescription>
        </CardHeader>
        <CardContent>
           <Link href="/historico-chamadas" passHref>
             <Button variant="secondary">
                <span>Saiba Mais</span>
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
           </Link>
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
