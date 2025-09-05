
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Earning, FuelEntry } from './registration-wizard';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  data: {
    km: number;
    hours: number;
    earnings: Earning[];
    fuelEntries: FuelEntry[];
  };
}

const StatItem = ({ label, value, className }: { label: string; value: string, className?: string }) => (
  <div className="flex justify-between items-center text-sm">
    <p className="text-muted-foreground">{label}</p>
    <p className={cn("font-semibold", className)}>{value}</p>
  </div>
);

export function LivePreview({ data }: LivePreviewProps) {
  const calculations = useMemo(() => {
    const totalGanhos = data.earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalCombustiveis = data.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const lucroLiquido = totalGanhos - totalCombustiveis;
    const totalViagens = data.earnings.reduce((sum, e) => sum + e.trips, 0);
    const totalLitros = data.fuelEntries.reduce((sum, f) => sum + (f.price > 0 ? f.paid / f.price : 0), 0);
    const eficiencia = data.km > 0 && totalLitros > 0 ? data.km / totalLitros : 0;
    const ganhoPorHoraBruto = data.hours > 0 ? totalGanhos / data.hours : 0;
    const ganhoPorHoraLiquido = data.hours > 0 ? lucroLiquido / data.hours : 0;
    const ganhoPorKmBruto = data.km > 0 ? totalGanhos / data.km : 0;
    const ganhoPorKmLiquido = data.km > 0 ? lucroLiquido / data.km : 0;
    
    return {
      totalGanhos,
      totalCombustiveis,
      lucroLiquido,
      totalViagens,
      totalLitros,
      eficiencia,
      ganhoPorHoraBruto,
      ganhoPorHoraLiquido,
      ganhoPorKmBruto,
      ganhoPorKmLiquido,
    };
  }, [data]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="font-headline">Prévia dos Cálculos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Lucro Líquido</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">{formatCurrency(calculations.lucroLiquido)}</p>
        </div>

        <Separator />
        
        <StatItem label="Total Ganhos" value={formatCurrency(calculations.totalGanhos)} className="text-green-600 dark:text-green-500" />
        <StatItem label="Gastos (Combustível)" value={formatCurrency(calculations.totalCombustiveis)} className="text-red-600 dark:text-red-500" />
        
        <Separator />
        
        <StatItem label="Total Viagens" value={calculations.totalViagens.toString()} />
        <StatItem label="Total Litros/m³" value={calculations.totalLitros.toFixed(2)} />
        <StatItem label="Eficiência" value={`${calculations.eficiencia.toFixed(2)} km/L`} />
        
        <Separator />
        
        <StatItem label="Ganho/Hora (Bruto)" value={formatCurrency(calculations.ganhoPorHoraBruto)} className="text-green-600 dark:text-green-500" />
        <StatItem label="Ganho/Hora (Líquido)" value={formatCurrency(calculations.ganhoPorHoraLiquido)} className="text-green-600 dark:text-green-500" />

        <Separator />

        <StatItem label="Ganho/KM (Bruto)" value={formatCurrency(calculations.ganhoPorKmBruto)} className="text-green-600 dark:text-green-500" />
        <StatItem label="Ganho/KM (Líquido)" value={formatCurrency(calculations.ganhoPorKmLiquido)} className="text-green-600 dark:text-green-500" />
      </CardContent>
    </Card>
  );
}
