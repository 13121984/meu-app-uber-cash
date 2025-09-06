
import { Wrench } from 'lucide-react';
import { MaintenanceClient } from '@/components/manutencao/maintenance-client';

export default async function ManutencaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Wrench className="w-8 h-8 text-primary" />
            Manutenção
        </h1>
        <p className="text-muted-foreground">Adicione e gerencie os gastos com a manutenção do seu veículo.</p>
      </div>
      <MaintenanceClient />
    </div>
  );
}
