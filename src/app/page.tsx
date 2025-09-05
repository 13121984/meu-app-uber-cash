
import { HomeClient } from '@/components/inicio/home-client';
import { getTodayData } from '@/services/work-day.service';

export default async function HomePage() {
  // Por enquanto, esta página será simples. Vamos adicionar a lógica do dia depois.
  return <HomeClient />;
}
