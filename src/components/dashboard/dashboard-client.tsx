

"use client"

import React, { useState, useTransition, useEffect } from "react"
import { DollarSign, Fuel, Map, Clock, TrendingUp, Car, CalendarDays, Zap, Wrench, BarChart3, GripVertical, Loader2, BarChart, Hourglass, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { cn } from "@/lib/utils"
import { MaintenanceSummary } from "./maintenance-summary"
import dynamic from 'next/dynamic';
import { getPeriodData } from "@/services/work-day.service"

const EarningsBarChart = dynamic(() => import('./earnings-bar-chart').then(mod => mod.EarningsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const TripsBarChart = dynamic(() => import('./trips-bar-chart').then(mod => mod.TripsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const EarningsPieChart = dynamic(() => import('./earnings-chart').then(mod => mod.EarningsPieChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });

export interface EarningsByCategory {
    name: string;
    total: number;
}

export interface TripsByCategory {
    name: string;
    total: number;
}

export interface MaintenanceData {
  totalSpent: number;
  servicesPerformed: number;
}

export interface PerformanceByShift {
    shift: 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite';
    profit: number;
    hours: number;
    profitPerHour: number;
}


export interface PeriodData {
  totalGanho: number;
  totalLucro: number;
  totalCombustivel: number;
  totalExtras: number;
  diasTrabalhados: number;
  totalKm: number;
  totalHoras: number;
  mediaHorasPorDia: number;
  mediaKmPorDia: number;
  ganhoPorHora: number;
  ganhoPorKm: number;
  totalViagens: number;
  eficiencia: number;
  earningsByCategory: EarningsByCategory[];
  tripsByCategory: TripsByCategory[];
  maintenance: MaintenanceData;
  meta: { target: number; period: string };
  profitComposition: { name: string; value: number; fill: string; totalGanho: number; }[];
  performanceByShift?: PerformanceByShift[];
}

export interface DashboardData {
  hoje: PeriodData;
  semana: PeriodData;
  mes: PeriodData;
}

interface DashboardClientProps {
  initialData: Partial<DashboardData>;
}

type Period = "hoje" | "semana" | "mes"

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [period, setPeriod] = useState<Period | null>(null);
  const [data, setData] = useState<Partial<DashboardData>>({});
  const [isLoading, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    startTransition(async () => {
      const periodData = await getPeriodData(newPeriod);
      setData(prevData => ({ ...prevData, [newPeriod]: periodData }));
    });
  };

  const periodMap: Record<Period, string> = {
      hoje: "Hoje",
      semana: "Esta Semana",
      mes: "Este Mês"
  };
  
  const currentData = period ? data[period] : null;
  const currentPeriodName = period ? periodMap[period] : 'Nenhum período selecionado';

  const renderContent = () => {
      if(isLoading) {
          return (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          );
      }

      if(!currentData) {
          return (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
                  <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">Selecione um Período</h2>
                  <p className="text-muted-foreground">Escolha uma das opções acima para ver seu resumo.</p>
              </Card>
          )
      }
      
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatsCard title="Lucro Líquido" value={currentData.totalLucro} icon={DollarSign} isCurrency iconBg="bg-green-500/20" iconColor="text-green-400" />
              <StatsCard title="Ganhos Brutos" value={currentData.totalGanho} icon={DollarSign} isCurrency iconBg="bg-primary/20" iconColor="text-primary" />
              <StatsCard title="Viagens" value={currentData.totalViagens} icon={Car} iconBg="bg-blue-500/20" iconColor="text-blue-400" />
              <StatsCard title="Dias Trabalhados" value={currentData.diasTrabalhados} icon={CalendarDays} iconBg="bg-sky-500/20" iconColor="text-sky-400" />
              <StatsCard title="Média de Horas/Dia" value={currentData.mediaHorasPorDia} icon={Hourglass} unit="h" iconBg="bg-orange-500/20" iconColor="text-orange-400" precision={1} />
              <StatsCard title="Média de KM/Dia" value={currentData.mediaKmPorDia} icon={Route} unit="km" iconBg="bg-purple-500/20" iconColor="text-purple-400" />
              <StatsCard title="Ganho/Hora" value={currentData.ganhoPorHora} isCurrency icon={TrendingUp} iconBg="bg-green-500/20" iconColor="text-green-400" precision={2} />
              <StatsCard title="Ganho/KM" value={currentData.ganhoPorKm} isCurrency icon={TrendingUp} iconBg="bg-blue-500/20" iconColor="text-blue-400" precision={2} />
              <StatsCard title="Eficiência Média" value={currentData.eficiencia} icon={Zap} unit="km/L" iconBg="bg-yellow-500/20" iconColor="text-yellow-400" precision={2} />
              <StatsCard title="Combustível" value={currentData.totalCombustivel} icon={Fuel} isCurrency iconBg="bg-red-500/20" iconColor="text-red-400" />
              <StatsCard title="KM Rodados" value={currentData.totalKm} icon={Map} unit="km" iconBg="bg-purple-500/20" iconColor="text-purple-400" />
              <StatsCard title="Horas Trabalhadas" value={currentData.totalHoras} icon={Clock} unit="h" iconBg="bg-orange-500/20" iconColor="text-orange-400" precision={1} />
          </div>

          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg">Meta de Lucro ({period ? periodMap[period] : ''})</CardTitle>
              </CardHeader>
              <CardContent>
                <GoalProgress progress={(currentData.meta.target > 0 ? (currentData.totalLucro / currentData.meta.target) * 100 : 0)} target={currentData.meta.target} current={currentData.totalLucro} />
              </CardContent>
          </Card>


          <MaintenanceSummary data={currentData.maintenance} />

          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Análise por Categoria ({period ? periodMap[period] : ''})
                  </CardTitle>
                  <CardDescription>
                    Detalhes sobre o desempenho das suas corridas por categoria.
                  </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-muted-foreground" />
                      Ganhos por Categoria
                    </h3>
                    <EarningsBarChart key={`earnings-${period}`} data={currentData.earningsByCategory} />
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-muted-foreground" />
                      Viagens por Categoria
                    </h3>
                    <TripsBarChart key={`trips-${period}`} data={currentData.tripsByCategory} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Composição dos Ganhos</CardTitle>
                    <CardDescription>
                        Distribuição do seu faturamento bruto no período.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EarningsPieChart key={`pie-${period}`} data={currentData.profitComposition} />
                </CardContent>
            </Card>
          </>
      )
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center w-full">
        <h1 className="text-4xl font-bold font-headline">Painel de Performance</h1>
        <p className="text-muted-foreground">Resumo de {currentPeriodName}</p>
      </div>

       <Card>
          <CardHeader>
              <CardTitle className="font-headline text-lg">Filtrar Período</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-2">
             {(["hoje", "semana", "mes"] as Period[]).map(p => (
                 <Button 
                    key={p} 
                    variant={period === p ? "default" : "secondary"}
                    onClick={() => handlePeriodChange(p)}
                    disabled={isLoading}
                    className={cn(
                        "rounded-full transition-all",
                        period === p ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    )}
                >
                    {periodMap[p]}
                </Button>
            ))}
          </CardContent>
      </Card>
      
      {renderContent()}
      
    </div>
  )
}
