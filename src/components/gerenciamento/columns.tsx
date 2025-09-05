
"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WorkDay } from "@/services/work-day.service"
import { EditWorkDayDialog } from "./edit-dialog"
import { deleteWorkDayAction } from "./actions"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
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
import { cn } from "@/lib/utils"


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


export const useWorkDayColumns = () => {
  const router = useRouter();
  const [editingWorkDay, setEditingWorkDay] = useState<WorkDay | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<WorkDay | null>(null);


  const handleDeleteClick = (e: React.MouseEvent, workDay: WorkDay) => {
    e.stopPropagation(); // Impede que o clique dispare o evento da linha
    setDayToDelete(workDay);
    setIsAlertOpen(true);
  }

  const handleEditClick = (e: React.MouseEvent, workDay: WorkDay) => {
    e.stopPropagation();
    setEditingWorkDay(workDay);
  }


  const handleConfirmDelete = async () => {
    if (!dayToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWorkDayAction(dayToDelete.id);
      toast({ title: "Sucesso!", description: "Registro apagado." });
      // A revalidação agora acontece no GerenciamentoClient para atualizar o estado local
    } catch (error) {
      toast({ title: "Erro!", description: "Não foi possível apagar o registro.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setDayToDelete(null);
    }
  }


  const columns: ColumnDef<WorkDay>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;
        return <div className="font-medium whitespace-nowrap">{format(date, "dd/MM/yy (EEE)", { locale: ptBR })}</div>
      },
      sortingFn: 'datetime',
    },
    {
      accessorKey: "lucro",
      header: () => <div className="text-right">Lucro</div>,
      cell: ({ row }) => {
        const earnings = row.original.earnings.reduce((sum, e) => sum + e.amount, 0);
        const fuel = row.original.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        const maintenance = row.original.maintenance?.amount || 0;
        const profit = earnings - fuel - maintenance;
        return <div className="text-green-600 font-semibold text-right">{formatCurrency(profit)}</div>
      }
    },
    {
      accessorKey: "totalGanhos",
      header: () => <div className="text-right hidden sm:table-cell">Ganhos</div>,
      cell: ({ row }) => {
         const earnings = row.original.earnings.reduce((sum, e) => sum + e.amount, 0);
         return <div className="text-right hidden sm:table-cell">{formatCurrency(earnings)}</div>
      }
    },
     {
      accessorKey: "totalGastos",
      header: () => <div className="text-right hidden md:table-cell">Gastos</div>,
      cell: ({ row }) => {
        const fuel = row.original.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        const maintenance = row.original.maintenance?.amount || 0;
        const total = fuel + maintenance;
        return <div className={cn("text-right hidden md:table-cell", total > 0 ? "text-red-600" : "text-muted-foreground")}>{formatCurrency(total)}</div>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workDay = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => handleEditClick(e, workDay)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => handleDeleteClick(e, workDay)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                 {isDeleting && dayToDelete?.id === workDay.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Apagar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ]

  const Dialogs = (
    <>
      <EditWorkDayDialog
        isOpen={!!editingWorkDay}
        onOpenChange={(isOpen) => !isOpen && setEditingWorkDay(null)}
        workDay={editingWorkDay}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente o registro de trabalho deste dia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Apagando..." : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  return { columns, Dialogs, setEditingWorkDay };
}
