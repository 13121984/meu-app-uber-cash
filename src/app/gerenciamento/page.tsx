
import { History } from 'lucide-react';
import { getWorkDays, WorkDay } from '@/services/work-day.service';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseISO, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const filterWorkDays = (workDays: WorkDay[], query: string, dateRange?: DateRange): WorkDay[] => {
  return workDays
    .filter(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);

      // Filter by Date Range
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        let toDate = dateRange.to ? new Date(dateRange.to) : fromDate;
        toDate.setHours(23, 59, 59, 999);
        
        if (!isWithinInterval(dayDate, { start: fromDate, end: toDate })) {
          return false;
        }
      }
      
      // Filter by Text Query
      if (query) {
        const dateString = new Date(day.date).toLocaleDateString('pt-BR');
        const searchString = JSON.stringify(day).toLowerCase();
        const queryLower = query.toLowerCase();

        return dateString.includes(queryLower) || searchString.includes(queryLower);
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export default async function GerenciamentoPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    from?: string;
    to?: string;
  };
}) {
  const query = searchParams?.query || '';
  const from = searchParams?.from ? parseISO(searchParams.from) : undefined;
  const to = searchParams?.to ? parseISO(searchParams.to) : undefined;
  const dateRange: DateRange | undefined = from ? { from, to } : undefined;

  const workDays = await getWorkDays();
  const filteredData = filterWorkDays(workDays, query, dateRange);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Histórico de Ganhos
        </h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Seus Registros</CardTitle>
            <CardDescription>
                Filtre e gerencie todos os seus dias de trabalho registrados.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <GerenciamentoClient data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
