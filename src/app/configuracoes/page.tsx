import { Settings, BookCopy } from 'lucide-react';
import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                Configurações
            </h1>
            <p className="text-muted-foreground">Ajuste as preferências e catálogos do aplicativo.</p>
        </div>
      </div>
      
      <ConfiguracoesClient />

    </div>
  );
}
