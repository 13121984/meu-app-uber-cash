import { BarChart } from 'lucide-react';
import { getReportData, type ReportData } from '@/services/work-day.service';
import { ReportsClient } from '@/components/relatorios/reports-client';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

// A página de relatórios agora é um Server Component que busca os dados
// com base nos parâmetros da URL.
export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams?: {
    type?: ReportFilterValues['type'];
    year?: string;
    month?: string;
    from?: string;
    to?: string;
  };
}) {

  // Monta o objeto de filtros a partir dos searchParams da URL.
  // Define 'thisMonth' como padrão se nenhum filtro for fornecido.
  const filters: ReportFilterValues = {
    type: searchParams?.type || 'thisMonth',
    year: searchParams?.year ? parseInt(searchParams.year) : undefined,
    month: searchParams?.month ? parseInt(searchParams.month) : undefined,
    dateRange: searchParams?.from ? {
      from: parseISO(searchParams.from),
      to: searchParams.to ? parseISO(searchParams.to) : undefined,
    } as DateRange : undefined,
  };

  // Busca os dados já filtrados no servidor.
  // Passamos um array vazio pois a função getReportData buscará os dados do arquivo.
  const reportData: ReportData = await getReportData([], filters);

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <BarChart className="w-8 h-8 text-primary" />
          Relatórios
        </h1>
      </div>
      
      {/* O componente cliente agora recebe os dados já processados e os filtros iniciais */}
      <ReportsClient initialReportData={reportData} initialFilters={filters} />
    </div>
  );
}
