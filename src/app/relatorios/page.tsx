import { getWorkDays } from '@/services/work-day.service';
import { ReportsClient } from '@/components/relatorios/reports-client';

export default async function RelatoriosPage() {
  // Carrega todos os dados inicialmente. O cliente irá filtrar.
  const allWorkDays = await getWorkDays();

  return <ReportsClient initialData={allWorkDays} />;
}
