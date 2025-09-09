
"use client";

import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { LayoutCustomizationClient } from '@/components/configuracoes/layout-customization-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LayoutPersonalizadoPage() {
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
           <p className="text-muted-foreground">Arraste os cards e gráficos para reordenar como eles aparecem na sua tela.</p>
        </div>
      </div>
      
      <LayoutCustomizationClient />
    </div>
  );
}
