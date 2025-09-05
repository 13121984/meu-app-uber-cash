
import { DashboardClient, type DashboardData } from '@/components/dashboard/dashboard-client';
import { getDashboardData } from '@/services/work-day.service';

export default async function DashboardPage() {
  const dashboardData: DashboardData = await getDashboardData();

  return <DashboardClient initialData={dashboardData} />;
}
