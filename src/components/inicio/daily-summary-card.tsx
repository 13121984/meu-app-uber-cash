
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Clock, TrendingUp, Target } from "lucide-react";
import type { PeriodData } from "../dashboard/dashboard-client";

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

  return (
    <Card className="h-full">
      <CardContent className="p-6 space-y-6">
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
            description={`${data.diasTrabalhados} dia de trabalho`}
        />

        <Separator />

        <StatItem 
            icon={TrendingUp}
            label="Valor Médio/Hora"
            value={formatCurrency(data.ganhoPorHora)}
            description="Média de ganhos por hora"
        />

        <Separator />
        
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4 text-amber-500" /> Meta Diária</p>
                <p className="font-semibold">{formatCurrency(data.meta.target)}</p>
            </div>
             <div className="relative h-2 w-full rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%`}}
              />
            </div>
            <p className="text-xs text-right text-muted-foreground">{progress.toFixed(0)}% atingido</p>
        </div>

      </CardContent>
    </Card>
  );
}
