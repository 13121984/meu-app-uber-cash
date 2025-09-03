
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
import { Badge } from "@/components/ui/badge"

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<WorkDay>[] = [
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
      return <div className="font-medium">{format(date, "dd/MM/yyyy")}</div>
    }
  },
  {
    accessorKey: "lucro",
    header: "Lucro Líquido",
    cell: ({ row }) => {
      const earnings = row.original.earnings.reduce((sum, e) => sum + e.amount, 0);
      const fuel = row.original.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
      const profit = earnings - fuel;
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
    header: "Gastos (Combustível)",
    cell: ({ row }) => {
      const fuel = row.original.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
      return <div className="text-red-600">{formatCurrency(fuel)}</div>
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(workDay.id ?? '')}
            >
              Copiar ID do Registro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Apagar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
