
import { History } from 'lucide-react';
import { getWorkDays } from '@/services/work-day.service';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';

export default async function GerenciamentoPage() {
  // A busca de dados agora é feita uma vez aqui
  // O componente cliente cuidará da filtragem
  const workDays = await getWorkDays();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Histórico de Ganhos
        </h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      
      {/* O componente cliente agora recebe todos os dados e gerencia seu próprio estado */}
      <GerenciamentoClient allWorkDays={workDays} />

    </div>
  );
}
