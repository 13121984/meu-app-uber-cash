
"use client";

import { useState, useTransition, useEffect } from "react";
import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import { HistoryFilters } from "./history-filters";
import { Button } from "../ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFilteredWorkDaysAction, ActiveFilters } from "./actions";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay } from "date-fns";
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { getWorkDays, type WorkDay } from '@/services/work-day.service';


export interface GroupedWorkDay {
  date: Date;
  totalProfit: number;
  totalHours: number;
  totalKm: number;
  entries: WorkDay[];
}

function groupWorkDays(workDays: WorkDay[]): GroupedWorkDay[] {
  const grouped = new Map<string, GroupedWorkDay>();

  workDays.forEach(day => {
    const dateKey = format(startOfDay(day.date), 'yyyy-MM-dd');
    
    let group = grouped.get(dateKey);
    if (!group) {
      group = {
        date: startOfDay(day.date),
        totalProfit: 0,
        totalHours: 0,
        totalKm: 0,
        entries: [],
      };
      grouped.set(dateKey, group);
    }
    
    const earnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const fuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const maintenance = day.maintenanceEntries?.reduce((sum, m) => sum + m.amount, 0) || 0;
    const profit = earnings - fuel - maintenance;

    group.totalProfit += profit;
    group.totalHours += day.hours;
    group.totalKm += day.km;
    group.entries.push(day);
  });

  return Array.from(grouped.values());
}


async function getFilteredWorkDays(
  allWorkDays: WorkDay[],
  filters?: ReportFilterValues
): Promise<GroupedWorkDay[]> {

  let filteredEntries: WorkDay[] = [];

  if (!filters || !filters.type || filters.type === 'today') {
    const today = new Date();
    filteredEntries = allWorkDays.filter(day => isSameDay(day.date, today));
  } else {
      const now = new Date();
      let interval: { start: Date; end: Date } | null = null;
       switch (filters.type) {
        case 'all':
          filteredEntries = allWorkDays;
          break;
        case 'thisWeek':
          interval = { start: startOfWeek(now), end: endOfWeek(now) };
          break;
        case 'thisMonth':
          interval = { start: startOfMonth(now), end: endOfMonth(now) };
          break;
        case 'specificMonth':
          if (filters.year !== undefined && filters.month !== undefined) {
            interval = { start: startOfMonth(new Date(filters.year, filters.month)), end: endOfMonth(new Date(filters.year, filters.month)) };
          }
          break;
        case 'specificYear':
          if (filters.year !== undefined) {
            interval = { start: startOfYear(new Date(filters.year, 0)), end: endOfYear(new Date(filters.year, 0)) };
          }
          break;
        case 'custom':
          if (filters.dateRange?.from) {
            interval = { start: startOfDay(filters.dateRange.from), end: filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(filters.dateRange.from) };
          }
          break;
      }
      if (interval) {
        filteredEntries = allWorkDays.filter(d => isWithinInterval(d.date, interval!));
      }
  }

  const groupedAndFiltered = groupWorkDays(filteredEntries);
  return groupedAndFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function parseFiltersFromParams(searchParams: URLSearchParams): ReportFilterValues {
    const type = (searchParams.get('type') as ReportFilterValues['type']) || 'today';
    const year = parseInt(searchParams.get('year') || '') || undefined;
    const month = parseInt(searchParams.get('month') || '') ?? undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    const filters: ReportFilterValues = { type };
    if (year) filters.year = year;
    if (month !== undefined) filters.month = month;
    if (from) {
        const fromDate = parseISO(from);
        if (isValid(fromDate)) {
            const toDate = to ? parseISO(to) : undefined;
            filters.dateRange = { from: fromDate, to: isValid(toDate) ? toDate : undefined };
        }
    }
    return filters;
}


export function GerenciamentoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { columns, Dialogs, setEditingDay } = useWorkDayColumns();

  const [isDeletingFiltered, startDeleteTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [groupedWorkDays, setGroupedWorkDays] = useState<GroupedWorkDay[]>([]);
  const [allWorkDaysCount, setAllWorkDaysCount] = useState(0);

  const initialFilters = parseFiltersFromParams(searchParams);
  const [activeFilters, setActiveFilters] = useState<ReportFilterValues | undefined>(initialFilters);

  useEffect(() => {
    startTransition(async () => {
      const allDays = await getWorkDays();
      const currentFilters = parseFiltersFromParams(new URLSearchParams(window.location.search));
      const filtered = await getFilteredWorkDays(allDays, currentFilters);
      setGroupedWorkDays(filtered);
      setAllWorkDaysCount(allDays.length);
    });
  }, [searchParams]);


  const filteredCount = groupedWorkDays.reduce((acc, day) => acc + day.entries.length, 0);

  const handleDeleteFiltered = async () => {
    if (!activeFilters) return;

    startDeleteTransition(async () => {
      try {
          const result = await deleteFilteredWorkDaysAction(activeFilters as ActiveFilters);
          if (result.success) {
              toast({ title: "Sucesso!", description: `${result.count || 0} registros apagados.` });
              router.refresh();
          } else {
              toast({ title: "Erro!", description: result.error, variant: "destructive" });
          }
      } catch (error) {
          toast({ title: "Erro Inesperado!", description: "Ocorreu um erro ao apagar os registros.", variant: "destructive" });
      } finally {
          setIsAlertOpen(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Seus Registros</CardTitle>
          <CardDescription>
            Total de {allWorkDaysCount} registros no histórico. Use os filtros para encontrar dias específicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryFilters 
            isPending={isPending} 
            startTransition={startTransition}
            onFiltersChange={setActiveFilters}
            initialFilters={initialFilters}
          />
          {activeFilters && filteredCount > 0 && (
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
             {isPending ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <DataTable 
                  columns={columns} 
                  data={groupedWorkDays}
                  onRowClick={(row) => setEditingDay(row.original)} 
                />
             )}
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
              {isDeletingFiltered ? "Apagando..." : "Sim, apagar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
