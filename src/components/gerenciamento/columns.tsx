
"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

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


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


export const ColumnsComponent = () => {
  const router = useRouter();
  const [editingWorkDay, setEditingWorkDay] = useState<WorkDay | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<WorkDay | null>(null);


  const handleDeleteClick = (workDay: WorkDay) => {
    setDayToDelete(workDay);
    setIsAlertOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!dayToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWorkDayAction(dayToDelete.id);
      toast({ title: "Sucesso!", description: "Registro apagado." });
      router.refresh();
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
        return <div className="font-medium">{new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
      }
    },
    {
      accessorKey: "lucro",
      header: "Lucro Líquido",
      cell: ({ row }) => {
        const earnings = row.original.earnings.reduce((sum, e) => sum + e.amount, 0);
        const fuel = row.original.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        const maintenance = row.original.maintenance?.amount || 0;
        const profit = earnings - fuel - maintenance;
        return <div className="text-green-600 font-semibold">{formatCurrency(profit)}</div>
      }
    },
    {
      accessorKey: "totalGanhos",
      header: "Ganhos (Bruto)",
      cell: ({ row }) => {
         const earnings = row.original.earnings.reduce((sum, e) => sum + e.amount, 0);
         return <div>{formatCurrency(earnings)}</div>
      }
    },
     {
      accessorKey: "totalGastos",
      header: "Gastos (Comb. + Manut.)",
      cell: ({ row }) => {
        const fuel = row.original.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        const maintenance = row.original.maintenance?.amount || 0;
        const total = fuel + maintenance;
        return <div className="text-red-600">{formatCurrency(total)}</div>
      }
    },
    {
      accessorKey: "km",
      header: "KM Rodados",
      cell: ({ row }) => `${row.getValue("km")} km`
    },
    {
      accessorKey: "hours",
      header: "Horas",
       cell: ({ row }) => `${row.getValue("hours")} h`
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workDay = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setEditingWorkDay(workDay)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteClick(workDay)}
              >
                Apagar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return {
    columns,
    dialog: (
      <EditWorkDayDialog
        isOpen={!!editingWorkDay}
        onOpenChange={(isOpen) => !isOpen && setEditingWorkDay(null)}
        workDay={editingWorkDay}
      />
    ),
    alertDialog: (
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
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? "Apagando..." : "Apagar"}
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  };
}

// Importar AlertDialog e seus componentes para uso no componente
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

