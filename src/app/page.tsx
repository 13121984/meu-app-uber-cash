
import { HomeClient } from '@/components/inicio/home-client';
import { getTodayData } from '@/services/work-day.service';
import type { PeriodData } from '@/components/dashboard/dashboard-client';

export default async function InicioPage() {
  const todayData: PeriodData = await getTodayData();
  
  return <HomeClient todayData={todayData} />;
}

