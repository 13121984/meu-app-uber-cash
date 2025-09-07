
import { TaximeterClient } from '@/components/taximetro/taximeter-client';
import { Calculator } from 'lucide-react';

export default async function TaximetroPage() {
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Taxímetro Inteligente
        </h1>
        <p className="text-muted-foreground">Calcule o valor ideal para suas corridas particulares com base em suas tarifas.</p>
      </div>
      
      <TaximeterClient />

    </div>
  );
}
