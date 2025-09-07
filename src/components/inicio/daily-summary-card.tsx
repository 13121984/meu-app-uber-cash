
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Clock, TrendingUp, Target, Car } from "lucide-react";
import type { PeriodData } from "@/services/summary.service";

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const StatItem = ({ icon: Icon, label, value, description, iconColor }: { icon: React.ElementType, label: string, value: string, description: string, iconColor?: string }) => (
    <div className="flex gap-4 items-start">
        <div className="text-muted-foreground pt-1">
             <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    </div>
);


interface DailySummaryCardProps {
    data: PeriodData;
}


export function DailySummaryCard({ data }: DailySummaryCardProps) {

  const progress = data.meta.target > 0 ? (data.totalLucro / data.meta.target) * 100 : 0;
  const clampedProgress = Math.min(progress, 100);
  const remaining = data.meta.target - data.totalLucro;
  const isComplete = progress >= 100;

  return (
    <Card className="h-full">
      <CardContent className="p-6 space-y-6 flex flex-col justify-between h-full">
        <div className="space-y-6">
            <StatItem 
                icon={DollarSign}
                label="Lucro do Dia"
                value={formatCurrency(data.totalLucro)}
                description={`Ganhos de ${formatCurrency(data.totalGanho)}`}
                iconColor="text-green-500"
            />

            <Separator />

            <StatItem 
                icon={Clock}
                label="Horas Trabalhadas"
                value={`${data.totalHoras.toFixed(1)}h`}
                description={`${data.diasTrabalhados > 0 ? data.diasTrabalhados : 'Nenhum'} dia de trabalho`}
                iconColor="text-amber-500"
            />

            <Separator />

            <StatItem 
                icon={TrendingUp}
                label="Valor Médio/Hora"
                value={formatCurrency(data.ganhoPorHora)}
                description="Média de ganhos por hora"
                iconColor="text-blue-500"
            />
        </div>
        
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4 text-amber-500" /> Meta Diária</p>
                <p className="font-semibold">{formatCurrency(data.meta.target)}</p>
            </div>
             <div className="w-full px-1">
                <div className="relative h-2 w-full rounded-full bg-secondary">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${clampedProgress}%`}}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                    style={{ left: `calc(${clampedProgress}% - 12px)` }}
                  >
                     <Car className="h-6 w-6 text-primary" fill="currentColor" />
                  </div>
                   <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                   <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border-2 border-foreground" />
                </div>
                 <div className="w-full h-px border-b border-dashed border-gray-600 mt-1" />
              </div>
            <div className="text-center">
                <p className="font-semibold text-lg text-foreground">{clampedProgress.toFixed(0)}% da meta</p>
                 {remaining > 0 && !isComplete && (
                  <p className="text-xs text-yellow-400 mt-1">Faltam {formatCurrency(remaining)} para sua meta</p>
                )}
                 {isComplete && (
                    <p className="text-xs text-green-400 font-semibold mt-1">Meta atingida!</p>
                 )}
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
