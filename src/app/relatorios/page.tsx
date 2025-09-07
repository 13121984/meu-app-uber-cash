
import { BarChart, Lock } from 'lucide-react';
import { ReportsClient } from '@/components/relatorios/reports-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserById } from '@/services/auth.service';
import { cookies } from 'next/headers';
import { useAuth } from '@/contexts/auth-context';


// Esta página agora decide se mostra o conteúdo completo ou a tela de upgrade
export default async function RelatoriosPage() {
  // Simulação de como pegar o usuário logado no server-side.
  // Em um app real, isso viria de uma sessão ou token.
  // Por agora, vamos assumir que não temos acesso direto ao usuário aqui
  // e faremos a lógica no cliente, que é mais simples para o nosso setup.

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <BarChart className="w-8 h-8 text-primary" />
          Relatórios e Análises
        </h1>
      </div>
      
      <ReportsClient />
    </div>
  );
}
