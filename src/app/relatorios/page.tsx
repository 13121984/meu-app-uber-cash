
import { ReportsClient } from '@/components/relatorios/reports-client';
import { getReportData } from '@/services/summary.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { BarChart3 } from 'lucide-react';

// Esta página agora decide se mostra o conteúdo completo ou a tela de upgrade
export default async function RelatoriosPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  
  const filters: ReportFilterValues = {
      type: (searchParams.type as ReportFilterValues['type']) || 'thisMonth',
      year: searchParams.year ? parseInt(searchParams.year as string) : new Date().getFullYear(),
      month: searchParams.month ? parseInt(searchParams.month as string) : new Date().getMonth(),
      dateRange: searchParams.from ? {
          from: new Date(searchParams.from as string),
          to: searchParams.to ? new Date(searchParams.to as string) : undefined
      } : undefined
  }

  const initialReportData = await getReportData(filters);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Relatórios Detalhados
        </h1>
        <p className="text-muted-foreground">Use os filtros para analisar sua performance em diferentes períodos.</p>
      </div>
      <ReportsClient initialData={initialReportData} initialFilters={filters} />
    </div>
  );
}
