
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Clock, TrendingUp, Target, Flag, Rocket } from "lucide-react";
import type { PeriodData } from "@/services/summary.service";
import { AppLogo } from "../ui/app-logo";

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
  const remainingValue = data.meta.target - data.totalLucro;
  const isComplete = progress >= 100;

  // Calcula as horas restantes
  const remainingHours = (!isComplete && data.ganhoPorHora > 0 && remainingValue > 0) 
    ? remainingValue / data.ganhoPorHora 
    : 0;

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
        
        <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Meta Diária</p>
                <p className="font-semibold">{formatCurrency(data.meta.target)}</p>
            </div>
             <div className="w-full h-10 flex items-center">
                {/* A "Estrada" da Meta */}
                <div className="relative w-full flex items-center h-full">
                    {/* A Linha da Estrada */}
                    <div className="w-full h-1 bg-secondary rounded-full">
                        <div 
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${clampedProgress}%`}}
                        />
                    </div>
                    
                    {/* O Ícone em movimento (agora um foguete) */}
                    <div
                        className="absolute top-1/2 transition-all duration-500"
                        style={{ 
                            left: `calc(${clampedProgress}% - 16px)`, // Ajusta a posição do ícone
                            transform: 'translateY(-50%)'
                        }}
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center p-0.5 animate-shake">
                            <Rocket className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    {/* Linha de Chegada */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <Flag className="h-5 w-5 text-foreground" />
                    </div>
                </div>
              </div>
            <div className="text-center">
                <p className="font-semibold text-lg text-foreground">{clampedProgress.toFixed(0)}% da meta</p>
                 {remainingValue > 0 && !isComplete && (
                  <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Faltam {formatCurrency(remainingValue)} para sua meta</p>
                )}
                 {remainingHours > 0 && (
                    <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">Cerca de {remainingHours.toFixed(1)} horas para sua meta.</p>
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
