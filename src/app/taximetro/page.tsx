
"use client";

import { CalculatorIcon, Loader2 } from "lucide-react";
import { TaximeterClient } from "@/components/taximetro/taximeter-client";
import { useAuth } from "@/contexts/auth-context";

export default function TaximetroPage() {
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
          <CalculatorIcon className="w-8 h-8 text-primary" />
          Taxímetro Inteligente
        </h1>
        <p className="text-muted-foreground">
          Calcule suas corridas particulares em tempo real com base nas suas
          tarifas.
        </p>
      </div>
      <TaximeterClient />
    </div>
  );
}
