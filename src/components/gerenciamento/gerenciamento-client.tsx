
"use client";

import { useState, useMemo, useTransition } from "react";
import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import type { WorkDay } from "@/services/work-day.service";
import { HistoryFilters } from "./history-filters";
import { Button } from "../ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFilteredWorkDaysAction } from "./actions";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { parseISO, format } from "date-fns";

interface GerenciamentoClientProps {
  allWorkDays: WorkDay[];
}

export function GerenciamentoClient({ allWorkDays }: GerenciamentoClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { columns, Dialogs, setEditingWorkDay } = useWorkDayColumns();

  const [isDeletingFiltered, setIsDeletingFiltered] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get('query') || '';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  
  const filteredData = useMemo(() => {
    return allWorkDays
      .map(day => ({
        ...day,
        date: typeof day.date === 'string' ? parseISO(day.date) : day.date
      }))
      .filter(day => {
        const dayDateString = format(day.date, 'yyyy-MM-dd');
        
        if (from) {
          const fromDateString = from;
          const toDateString = to || from;

          if (dayDateString < fromDateString || dayDateString > toDateString) {
            return false;
          }
        }
        
        if (query) {
          const dateString = format(day.date, 'dd/MM/yyyy');
          const searchString = JSON.stringify(day).toLowerCase();
          const queryLower = query.toLowerCase();

          return dateString.includes(queryLower) || searchString.includes(queryLower);
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allWorkDays, query, from, to]);

  const hasFilters = searchParams.has('query') || searchParams.has('from');

  const handleDeleteFiltered = async () => {
    setIsDeletingFiltered(true);
    try {
        const result = await deleteFilteredWorkDaysAction(filteredData);
        if (result.success) {
            toast({ title: "Sucesso!", description: `${filteredData.length} registros apagados.` });
            startTransition(() => {
              router.refresh();
            });
        } else {
            toast({ title: "Erro!", description: result.error, variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Erro Inesperado!", description: "Ocorreu um erro ao apagar os registros.", variant: "destructive" });
    } finally {
        setIsDeletingFiltered(false);
        setIsAlertOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Seus Registros</CardTitle>
          <CardDescription>
            Clique em um registro para editar. Filtre e gerencie todos os seus dias de trabalho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryFilters isPending={isPending} />
          {hasFilters && filteredData.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                onClick={() => setIsAlertOpen(true)}
                disabled={isDeletingFiltered || isPending}
              >
                {isDeletingFiltered ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Apagar {filteredData.length} {filteredData.length === 1 ? 'Registro Filtrado' : 'Registros Filtrados'}
              </Button>
            </div>
          )}
          <div className="mt-4">
            <DataTable 
              columns={columns} 
              data={filteredData}
              onRowClick={(row) => setEditingWorkDay(row.original)} 
            />
          </div>
        </CardContent>
      </Card>

      {Dialogs}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente os <b>{filteredData.length}</b> registros de trabalho que correspondem aos filtros atuais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFiltered} disabled={isDeletingFiltered} className="bg-destructive hover:bg-destructive/90">
              {isDeletingFiltered ? "Apagando..." : "Apagar Tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
