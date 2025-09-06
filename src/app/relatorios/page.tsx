
import { BarChart } from 'lucide-react';
import { ReportsClient } from '@/components/relatorios/reports-client';

// A página agora é um Server Component simples que renderiza o componente cliente.
// Toda a lógica de busca e estado foi movida para o cliente para carregamento sob demanda.
export default async function RelatoriosPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <BarChart className="w-8 h-8 text-primary" />
          Relatórios
        </h1>
      </div>
      
      {/* O componente cliente agora gerencia seus próprios dados e filtros */}
      <ReportsClient />
    </div>
  );
}
