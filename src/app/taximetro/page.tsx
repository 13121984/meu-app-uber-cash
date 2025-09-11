
"use client";

import { TaximeterClient } from '@/components/taximetro/taximeter-client';
import { CalculatorIcon } from 'lucide-react';


export default function TaximetroPage() {
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <CalculatorIcon className="w-8 h-8 text-primary" />
            Taxímetro Inteligente
        </h1>
        <p className="text-muted-foreground">Calcule suas corridas particulares em tempo real com base nas suas tarifas.</p>
      </div>
      <TaximeterClient />
    </div>
  );
}
