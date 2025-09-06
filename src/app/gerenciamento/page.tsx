
import { History } from 'lucide-react';
import { getWorkDays } from '@/services/work-day.service';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';
import type { WorkDay } from '@/services/work-day.service';
import { parseISO, format, startOfDay } from "date-fns";

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
    const maintenance = day.maintenance?.amount || 0;
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
  query?: string,
  from?: string,
  to?: string
): Promise<GroupedWorkDay[]> {
  const allDaysProcessed = allWorkDays
    .map(day => ({
      ...day,
      date: typeof day.date === 'string' ? parseISO(day.date) : day.date
    }));

  const filteredEntries = allDaysProcessed.filter(day => {
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
        // A busca agora considera o dia inteiro, mesmo que apenas uma entrada corresponda
        const searchString = JSON.stringify(day).toLowerCase();
        const queryLower = query.toLowerCase();

        return dateString.includes(queryLower) || searchString.includes(queryLower);
      }

      return true;
    });

    const groupedAndFiltered = groupWorkDays(filteredEntries);

    return groupedAndFiltered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export default async function GerenciamentoPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    from?: string;
    to?: string;
  };
}) {
  // A busca de todos os dias de trabalho ainda é necessária
  const allWorkDays = await getWorkDays();

  // A filtragem e agrupamento são feitos aqui, no servidor
  const groupedAndFilteredWorkDays = await getFilteredWorkDays(
    allWorkDays,
    searchParams?.query,
    searchParams?.from,
    searchParams?.to
  );

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
        groupedWorkDays={groupedAndFilteredWorkDays} 
        allWorkDaysCount={allWorkDays.length}
      />

    </div>
  );
}
