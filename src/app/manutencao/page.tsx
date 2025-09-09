
"use client";

import { Wrench, Loader2 } from 'lucide-react';
import { MaintenanceClient } from '@/components/manutencao/maintenance-client';
import { useAuth } from '@/contexts/auth-context';

export default function ManutencaoPage() {
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
            <Wrench className="w-8 h-8 text-primary" />
            Manutenção
        </h1>
        <p className="text-muted-foreground">Adicione e gerencie os gastos com a manutenção do seu veículo.</p>
      </div>
      <MaintenanceClient />
    </div>
  );
}
