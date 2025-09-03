import { getWorkDays } from '@/services/work-day.service';
import { ReportsClient } from '@/components/relatorios/reports-client';

export default async function RelatoriosPage() {
  // Carrega todos os dados inicialmente. O cliente irá filtrar.
  const allWorkDays = await getWorkDays();
  
  // Garante que o Next.js não fará cache estático desta página, 
  // para que os dados sejam sempre frescos a cada visita.
  const dynamic = 'force-dynamic'; 

  return <ReportsClient initialData={allWorkDays} />;
}
