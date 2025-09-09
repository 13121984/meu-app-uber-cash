
"use client";

import { Settings } from 'lucide-react';
import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function ConfiguracoesPage() {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                Configurações
            </h1>
            <p className="text-muted-foreground">Ajuste as preferências, gerencie seus veículos e dados do aplicativo.</p>
        </div>
      </div>
      
      <ConfiguracoesClient />

    </div>
  );
}
