
import { Wrench } from 'lucide-react';
import { MaintenanceClient } from '@/components/manutencao/maintenance-client';
import { getMaintenanceRecords } from '@/services/maintenance.service';
import type { DateRange } from 'react-day-picker';
import { parseISO, isValid } from 'date-fns';

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
  
  // Validação mais robusta das datas
  const fromParam = searchParams?.from;
  const toParam = searchParams?.to;
  let dateRange: DateRange | undefined;
  
  if (fromParam) {
    const fromDate = parseISO(fromParam);
    if (isValid(fromDate)) {
      const toDate = toParam ? parseISO(toParam) : undefined;
      dateRange = { from: fromDate, to: isValid(toDate) ? toDate : undefined };
    }
  }

  // A busca de dados agora é mais otimizada, mas ainda feita no servidor
  // com base nos filtros da URL, garantindo performance.
  const allRecords = await getMaintenanceRecords({ query, dateRange });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Wrench className="w-8 h-8 text-primary" />
            Manutenção
        </h1>
        <p className="text-muted-foreground">Adicione e gerencie os gastos com a manutenção do seu veículo.</p>
      </div>
      <MaintenanceClient allRecords={allRecords} />
    </div>
  );
}
