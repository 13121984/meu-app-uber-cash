
import { HomeClient } from '@/components/inicio/home-client';
import { getTodayData } from '@/services/work-day.service';

export default async function HomePage() {
  const todayData = await getTodayData();
  return <HomeClient todayData={todayData} />;
}
