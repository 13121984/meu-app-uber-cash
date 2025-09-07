
import { ReportsClient } from '@/components/relatorios/reports-client';
import { BarChart3 } from 'lucide-react';

// Esta página agora decide se mostra o conteúdo completo ou a tela de upgrade
export default async function RelatoriosPage() {
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Relatórios Detalhados
        </h1>
        <p className="text-muted-foreground">Use os filtros para analisar sua performance em diferentes períodos.</p>
      </div>
      <ReportsClient />
    </div>
  );
}
