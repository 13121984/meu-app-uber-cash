
import { Wrench } from 'lucide-react';
import { MaintenanceClient } from '@/components/manutencao/maintenance-client';
import { getMaintenanceRecords } from '@/services/maintenance.service';
import type { DateRange } from 'react-day-picker';
import { parseISO } from 'date-fns';

export default async function ManutencaoPage({
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

  const dateRange: DateRange | undefined = from
    ? { from, to: to || from }
    : undefined;

  const allRecords = await getMaintenanceRecords();

  const filteredRecords = allRecords.filter(record => {
    // Filter by Date
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      let toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      toDate.setHours(23, 59, 59, 999);

      const recordDate = new Date(record.date);
      
      if (recordDate < fromDate || recordDate > toDate) {
        return false;
      }
    }
    
    // Filter by Text Query
    if (query) {
        const queryLower = query.toLowerCase();
        if (!record.description.toLowerCase().includes(queryLower)) {
            return false;
        }
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Wrench className="w-8 h-8 text-orange-500" />
            Manutenção
        </h1>
        <p className="text-muted-foreground">Adicione e gerencie os gastos com a manutenção do seu veículo.</p>
      </div>
      <MaintenanceClient allRecords={allRecords} filteredRecords={filteredRecords} />
    </div>
  );
}
