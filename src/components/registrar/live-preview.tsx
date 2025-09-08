
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { State } from './registration-wizard';
import { cn } from '@/lib/utils';
import { DollarSign, Droplet, TrendingUp, CircleDollarSign, Car, Gauge, Route } from 'lucide-react';

interface LivePreviewProps {
  data: State;
}

const StatItem = ({ label, value, className, isMain = false }: { label: string; value: string, className?: string, isMain?: boolean }) => (
  <div className={cn("p-3 rounded-lg", isMain ? "bg-card" : "bg-secondary/50", className)}>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={cn("font-bold", isMain ? "text-2xl" : "text-lg")}>{value}</p>
  </div>
);

export function LivePreview({ data }: LivePreviewProps) {
  const calculations = useMemo(() => {
    const totalGanhos = data.earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalCombustiveis = data.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const totalManutencao = data.maintenanceEntries.reduce((sum, m) => sum + m.amount, 0);
    const totalDespesas = totalCombustiveis + totalManutencao;
    const lucroLiquido = totalGanhos - totalDespesas;
    const totalViagens = data.earnings.reduce((sum, e) => sum + e.trips, 0);
    const totalLitros = data.fuelEntries.reduce((sum, f) => sum + (f.price > 0 ? f.paid / f.price : 0), 0);
    const eficiencia = data.km > 0 && totalLitros > 0 ? data.km / totalLitros : 0;
    const ganhoBrutoPorHora = data.hours > 0 ? totalGanhos / data.hours : 0;
    const ganhoLiquidoPorHora = data.hours > 0 ? lucroLiquido / data.hours : 0;
    const ganhoBrutoPorKm = data.km > 0 ? totalGanhos / data.km : 0;
    const ganhoLiquidoPorKm = data.km > 0 ? lucroLiquido / data.km : 0;
    
    return {
      totalGanhos,
      totalCombustiveis,
      totalManutencao,
      lucroLiquido,
      totalViagens,
      eficiencia,
      ganhoBrutoPorHora,
      ganhoLiquidoPorHora,
      ganhoBrutoPorKm,
      ganhoLiquidoPorKm,
    };
  }, [data]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            Prévia dos Cálculos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        <div className="grid grid-cols-2 gap-3">
             <StatItem label="Ganhos" value={formatCurrency(calculations.totalGanhos)} className="text-green-500" />
             <StatItem label="Despesas" value={formatCurrency(calculations.totalCombustiveis + calculations.totalManutencao)} className="text-red-500" />
        </div>
        
        <StatItem 
            label="Lucro Líquido do Período" 
            value={formatCurrency(calculations.lucroLiquido)} 
            className="text-primary bg-primary/10" 
            isMain 
        />
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-3">
            <StatItem label="R$/Hora (Bruto)" value={formatCurrency(calculations.ganhoBrutoPorHora)} />
            <StatItem label="R$/KM (Bruto)" value={formatCurrency(calculations.ganhoBrutoPorKm)} />
            <StatItem label="R$/Hora (Líquido)" value={formatCurrency(calculations.ganhoLiquidoPorHora)} />
            <StatItem label="R$/KM (Líquido)" value={formatCurrency(calculations.ganhoLiquidoPorKm)} />
            <StatItem label="Eficiência" value={`${calculations.eficiencia.toFixed(2)} km/L`} />
            <StatItem label="Viagens" value={calculations.totalViagens.toString()} />
        </div>
      </CardContent>
    </Card>
  );
}
