

import { History } from 'lucide-react';
import { getWorkDays } from '@/services/work-day.service';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function GerenciamentoPage() {
  const workDays = await getWorkDays();
  const dataForTable = workDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Histórico de Ganhos
        </h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Seus Registros</CardTitle>
            <CardDescription>
                Aqui está a lista de todos os seus dias de trabalho registrados.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <GerenciamentoClient data={dataForTable} />
        </CardContent>
      </Card>
    </div>
  );
}
