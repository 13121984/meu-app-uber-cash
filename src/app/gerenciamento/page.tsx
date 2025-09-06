
import { History } from 'lucide-react';
import { getWorkDays, getWorkDaysForDate, type WorkDay } from '@/services/work-day.service';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay } from "date-fns";

// Interface para representar um dia agrupado
export interface GroupedWorkDay {
  date: Date;
  totalProfit: number;
  totalHours: number;
  totalKm: number;
  entries: WorkDay[];
}

// Agrupa os dias de trabalho por data
function groupWorkDays(workDays: WorkDay[]): GroupedWorkDay[] {
  const grouped = new Map<string, GroupedWorkDay>();

  workDays.forEach(day => {
    // Normaliza a data para ignorar a hora
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


// A filtragem agora acontece no servidor, antes de renderizar a página.
async function getFilteredWorkDays(
  allWorkDays: WorkDay[],
  filters?: ReportFilterValues
): Promise<GroupedWorkDay[]> {

  let filteredEntries: WorkDay[] = [];

  // Se nenhum filtro for fornecido, mostra apenas os dados de hoje.
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


export default async function GerenciamentoPage({
  searchParams,
}: {
  searchParams?: ReportFilterValues;
}) {
  // Busca todos os dias de trabalho. A filtragem ocorrerá abaixo.
  const allWorkDays = await getWorkDays();
  
  // A filtragem e agrupamento são feitos aqui, no servidor.
  // Por padrão, mostra apenas os registros de hoje.
  const groupedAndFilteredWorkDays = await getFilteredWorkDays(allWorkDays, searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Histórico de Ganhos
        </h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados. Os registros são agrupados por dia.</p>
      </div>
      
      <GerenciamentoClient 
        initialGroupedWorkDays={groupedAndFilteredWorkDays} 
        allWorkDaysCount={allWorkDays.length}
        initialFilters={searchParams}
      />

    </div>
  );
}
