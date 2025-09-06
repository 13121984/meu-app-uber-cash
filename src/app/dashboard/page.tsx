
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  // A página agora carrega instantaneamente, sem dados iniciais do servidor.
  // O DashboardClient buscará os dados de "hoje" no lado do cliente.
  return <DashboardClient initialData={{}} />;
}
