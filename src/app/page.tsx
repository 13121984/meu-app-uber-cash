
import { DashboardClient, type DashboardData } from '@/components/dashboard/dashboard-client';
import { getDashboardData } from '@/services/work-day.service';

export default async function DashboardPage() {
  const dashboardData: DashboardData = await getDashboardData();
  
  // Garante que o Next.js não fará cache estático desta página, 
  // para que os dados sejam sempre frescos a cada visita.
  // A alternativa seria usar 'no-store' ou 'revalidate'
  const dynamic = 'force-dynamic'; 

  return <DashboardClient initialData={dashboardData} />;
}
