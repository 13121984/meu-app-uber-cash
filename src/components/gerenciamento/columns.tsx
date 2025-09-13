
"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditWorkDayDialog } from "./edit-dialog"
import { toast } from "@/hooks/use-toast"
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
import { format, parseISO } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/contexts/auth-context"
import { deleteFilteredWorkDaysAction } from "@/app/gerenciamento/actions"
import type { GroupedWorkDay } from '@/components/gerenciamento/gerenciamento-client'

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const useWorkDayColumns = () => {
  const { user } = useAuth();
  const [editingDay, setEditingDay] = useState<GroupedWorkDay | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<GroupedWorkDay | null>(null);
  
  const handleEditClick = (e: React.MouseEvent, day: GroupedWorkDay) => {
    e.stopPropagation();
    setEditingDay(day);
  }

  const handleConfirmDelete = async () => {
    if (!dayToDelete || !user) return;
    setIsDeleting(true);
    try {
      await deleteFilteredWorkDaysAction(user.id, { type: 'custom', dateRange: { from: dayToDelete.date, to: dayToDelete.date } });
      toast({ title: "Sucesso!", description: `Registros de ${format(dayToDelete.date, 'dd/MM/yyyy')} apagados.` });
    } catch (error) {
      toast({ title: "Erro!", description: "Não foi possível apagar os registros.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setDayToDelete(null);
    }
  }

  const columns: ColumnDef<GroupedWorkDay>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const day = row.original;
        const date = typeof day.date === 'string' ? parseISO(day.date) : day.date;
        return (
            <div className="font-medium whitespace-nowrap">
                <div>{format(date, "dd/MM/yy (EEE)", { locale: ptBR })}</div>
                <div className="text-xs text-muted-foreground">{day.entries.length} {day.entries.length === 1 ? 'período' : 'períodos'}</div>
            </div>
        )
      },
      sortingFn: 'datetime',
    },
    {
      accessorKey: "totalProfit",
      header: () => <div className="text-right">Lucro Total</div>,
      cell: ({ row }) => {
        const profit = row.original.totalProfit;
        return <div className="text-green-600 dark:text-green-500 font-semibold text-right">{formatCurrency(profit)}</div>
      }
    },
    {
      accessorKey: "totalKm",
      header: () => <div className="text-right hidden sm:table-cell">Distância</div>,
      cell: ({ row }) => {
         const km = row.original.totalKm;
         return <div className="text-right hidden sm:table-cell">{km.toFixed(1)} km</div>
      }
    },
     {
      accessorKey: "totalHours",
      header: () => <div className="text-right hidden md:table-cell">Horas</div>,
      cell: ({ row }) => {
        const hours = row.original.totalHours;
        return <div className="text-right hidden md:table-cell">{hours.toFixed(1)} h</div>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const day = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => handleEditClick(e, day)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Detalhes
            </Button>
          </div>
        );
      },
    },
  ]

  const Dialogs = (
    <>
      <EditWorkDayDialog
        isOpen={!!editingDay}
        onOpenChange={(isOpen) => !isOpen && setEditingDay(null)}
        groupedWorkDay={editingDay}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente TODOS os registros de trabalho para o dia {dayToDelete && format(dayToDelete.date, 'dd/MM/yyyy')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Apagando..." : "Apagar Tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  return { columns, Dialogs, setEditingDay };
}
