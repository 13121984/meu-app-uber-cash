import { History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { HistoryClient } from '@/components/gerenciamento/history-client';
import { getWorkDays } from '@/services/work-day.service';

export default async function GerenciamentoPage() {
  const workDays = await getWorkDays();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gerenciar Ganhos</h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      <HistoryClient data={workDays} />
    </div>
  );
}
