
import { LayoutDashboard, Lock } from 'lucide-react';
import { ReportsClient } from '@/components/relatorios/reports-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function LayoutPersonalizadoPage() {

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Personalizar Layout
          </h1>
           <p className="text-muted-foreground">Arraste os cards para reordenar como eles aparecem na sua tela.</p>
        </div>
      </div>
      
      <ReportsClient />
    </div>
  );
}
