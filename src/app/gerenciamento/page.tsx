
"use client";

import { History } from 'lucide-react';
import { GerenciamentoClient } from '@/components/gerenciamento/gerenciamento-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function GerenciamentoPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Histórico de Ganhos
        </h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados. Os registros são agrupados por dia.</p>
      </div>
      
      <GerenciamentoClient />

    </div>
  );
}
