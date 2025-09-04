
"use client";

import { useState } from "react";
import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import type { WorkDay } from "@/services/work-day.service";
import { HistoryFilters } from "./history-filters";
import { Button } from "../ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFilteredWorkDaysAction } from "./actions";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useSearchParams } from "next/navigation";

export function GerenciamentoClient({ data }: { data: WorkDay[] }) {
  const { columns, Dialogs } = useWorkDayColumns();
  const searchParams = useSearchParams();
  const [isDeletingFiltered, setIsDeletingFiltered] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const hasFilters = searchParams.has('query') || searchParams.has('from');

  const handleDeleteFiltered = async () => {
    setIsDeletingFiltered(true);
    try {
        const result = await deleteFilteredWorkDaysAction(data);
        if (result.success) {
            toast({ title: "Sucesso!", description: `${data.length} registros apagados.` });
            // A revalidação no server action vai atualizar a UI
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
      <HistoryFilters />

       {hasFilters && data.length > 0 && (
         <div className="flex justify-end">
            <Button
                variant="destructive"
                onClick={() => setIsAlertOpen(true)}
                disabled={isDeletingFiltered}
            >
                {isDeletingFiltered ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Apagar {data.length} {data.length === 1 ? 'Registro Filtrado' : 'Registros Filtrados'}
            </Button>
         </div>
       )}

      <DataTable columns={columns} data={data} />
      {Dialogs}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente os <b>{data.length}</b> registros de trabalho que correspondem aos filtros atuais.
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
