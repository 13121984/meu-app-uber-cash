import { getWorkDays } from '@/services/work-day.service';
import { ReportsClient } from '@/components/relatorios/reports-client';

// Garante que o Next.js não fará cache estático desta página, 
// para que os dados sejam sempre frescos a cada visita.
export const dynamic = 'force-dynamic'; 

export default async function RelatoriosPage() {
  // Carrega todos os dados inicialmente. O cliente irá filtrar.
  const allWorkDays = await getWorkDays();

  return <ReportsClient initialData={allWorkDays} />;
}
