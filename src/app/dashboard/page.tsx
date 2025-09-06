
import { DashboardClient, type DashboardData } from '@/components/dashboard/dashboard-client';
import { getTodayData } from '@/services/work-day.service';

export default async function DashboardPage() {
  // Otimização: Busca apenas os dados de hoje no carregamento inicial do servidor.
  // Os dados da semana e do mês serão buscados no cliente sob demanda.
  const todayData = await getTodayData();

  const initialData: Partial<DashboardData> = {
    hoje: todayData,
  };

  return <DashboardClient initialData={initialData} />;
}
