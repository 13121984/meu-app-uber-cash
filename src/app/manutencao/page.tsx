
import { Wrench } from 'lucide-react';
import { MaintenanceClient } from '@/components/manutencao/maintenance-client';
import { getMaintenanceRecords } from '@/services/maintenance.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

async function getFilteredMaintenanceRecords(filters?: ReportFilterValues) {
    const allRecords = await getMaintenanceRecords();
    
    // Por padrão (sem filtro), mostra apenas os de hoje
    if (!filters || !filters.type || filters.type === 'today') {
        const today = new Date();
        return allRecords.filter(record => isSameDay(record.date, today));
    }
    
    let interval: { start: Date; end: Date } | null = null;
    const now = new Date();

    switch (filters.type) {
        case 'all':
          return allRecords;
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
        return allRecords.filter(record => isWithinInterval(record.date, interval!));
    }

    // Fallback para os registros de hoje se algo der errado
    return allRecords.filter(record => isSameDay(record.date, new Date()));
}


export default async function ManutencaoPage({
  searchParams,
}: {
  searchParams?: ReportFilterValues;
}) {

  const filteredRecords = await getFilteredMaintenanceRecords(searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Wrench className="w-8 h-8 text-primary" />
            Manutenção
        </h1>
        <p className="text-muted-foreground">Adicione e gerencie os gastos com a manutenção do seu veículo.</p>
      </div>
      <MaintenanceClient 
        initialRecords={filteredRecords}
        initialFilters={searchParams}
      />
    </div>
  );
}
