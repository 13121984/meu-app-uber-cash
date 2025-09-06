
"use client";

import { useState, useTransition } from "react";
import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import type { WorkDay } from "@/services/work-day.service";
import { HistoryFilters } from "./history-filters";
import { Button } from "../ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFilteredWorkDaysAction, ActiveFilters } from "./actions";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { GroupedWorkDay } from "@/app/gerenciamento/page";

interface GerenciamentoClientProps {
  groupedWorkDays: GroupedWorkDay[];
  allWorkDaysCount: number;
}

export function GerenciamentoClient({ groupedWorkDays, allWorkDaysCount }: GerenciamentoClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { columns, Dialogs, setEditingDay } = useWorkDayColumns();

  const [isDeletingFiltered, setIsDeletingFiltered] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasFilters = searchParams.has('query') || searchParams.has('from');
  const filteredCount = groupedWorkDays.reduce((acc, day) => acc + day.entries.length, 0);

  const handleDeleteFiltered = async () => {
    setIsDeletingFiltered(true);
    
    const activeFilters: ActiveFilters = {
      query: searchParams.get('query') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };
    
    try {
        const result = await deleteFilteredWorkDaysAction(activeFilters);
        if (result.success) {
            toast({ title: "Sucesso!", description: `${result.count || 0} registros apagados.` });
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
            Clique em um dia para ver os detalhes e editar os períodos. Total de {allWorkDaysCount} registros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryFilters isPending={isPending} />
          {hasFilters && filteredCount > 0 && (
            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                onClick={() => setIsAlertOpen(true)}
                disabled={isDeletingFiltered || isPending}
              >
                {isDeletingFiltered ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Apagar {filteredCount} {filteredCount === 1 ? 'Registro Filtrado' : 'Registros Filtrados'}
              </Button>
            </div>
          )}
          <div className="mt-4">
            <DataTable 
              columns={columns} 
              data={groupedWorkDays}
              onRowClick={(row) => setEditingDay(row.original)} 
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
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente os <b>{filteredCount}</b> registros de trabalho que correspondem aos filtros atuais.
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
