
"use client";

import { ReportsClient } from '@/components/relatorios/reports-client';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';


// Esta página agora decide se mostra o conteúdo completo ou a tela de upgrade
export default function RelatoriosPage() {
  const { user, loading, isPro } = useAuth();

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  // Se não for pro, você pode mostrar uma tela de upgrade aqui se quiser
  // Por enquanto, vamos permitir o acesso mas os componentes internos podem ter features limitadas
  
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
