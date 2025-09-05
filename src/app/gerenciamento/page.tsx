
import { History } from 'lucide-react';
import { getWorkDays } from '@/services/work-day.service';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';
import type { WorkDay } from '@/services/work-day.service';
import { parseISO, format } from "date-fns";

// A filtragem agora acontece no servidor, antes de renderizar a página.
async function getFilteredWorkDays(
  allWorkDays: WorkDay[],
  query?: string,
  from?: string,
  to?: string
): Promise<WorkDay[]> {
  return allWorkDays
    .map(day => ({
      ...day,
      date: typeof day.date === 'string' ? parseISO(day.date) : day.date
    }))
    .filter(day => {
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
        const searchString = JSON.stringify(day).toLowerCase();
        const queryLower = query.toLowerCase();

        return dateString.includes(queryLower) || searchString.includes(queryLower);
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  // A filtragem é feita aqui, no servidor, usando os searchParams
  const filteredWorkDays = await getFilteredWorkDays(
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
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      
      {/* O componente cliente agora recebe apenas os dados filtrados */}
      <GerenciamentoClient filteredWorkDays={filteredWorkDays} />

    </div>
  );
}
