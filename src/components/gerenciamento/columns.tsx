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
  
  const handleEditClick = (e: React.MouseEvent, day: GroupedWorkDay) => {
    e.stopPropagation();
    setEditingDay(day);
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
    <EditWorkDayDialog
      isOpen={!!editingDay}
      onOpenChange={(isOpen) => !isOpen && setEditingDay(null)}
      groupedWorkDay={editingDay}
    />
  )

  return { columns, Dialogs, setEditingDay };
}
