
"use client"

import React, { useState, useTransition, useEffect } from "react"
import { DollarSign, Fuel, Map, Clock, TrendingUp, Car, CalendarDays, Zap, Hourglass, Route, Loader2, BarChart, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic';
import { getSummaryForPeriod, PeriodData, SummaryData } from "@/services/summary.service"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { allStats, mandatoryCards } from '@/lib/dashboard-items';


const EarningsPieChart = dynamic(() => import('./earnings-chart').then(mod => mod.EarningsPieChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });

type Period = "hoje" | "semana" | "mes"

export function DashboardClient() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period | null>(null);
  const [data, setData] = useState<Partial<SummaryData>>({});
  const [isLoading, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    startTransition(async () => {
      const summary = await getSummaryForPeriod();
      setData(summary);
    });
  };

  useEffect(() => {
    handlePeriodChange('hoje');
  }, []);

  const periodMap: Record<Period, string> = {
      hoje: "Hoje",
      semana: "Esta Semana",
      mes: "Este Mês"
  };
  
  const currentData = period ? data[period] : null;
  const currentPeriodName = period ? periodMap[period] : 'Nenhum período selecionado';
  
  const isPremium = user?.isPremium || false;

  const renderContent = () => {
      if(isLoading && !currentData) {
          return (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          );
      }

      if(!currentData || currentData.diasTrabalhados === 0) {
          return (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
                  <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">Nenhum dado para o período</h2>
                  <p className="text-muted-foreground">Comece a registrar seus dias de trabalho.</p>
              </Card>
          )
      }

      // Determine the card order based on user preferences
      const userCardOrder = user?.preferences?.dashboardCardOrder;
      let orderedCardIds: string[] = [];
      
      if (userCardOrder && userCardOrder.length > 0) {
        orderedCardIds = userCardOrder;
      } else {
         if (isPremium) {
           orderedCardIds = allStats.map(s => s.id);
         } else {
           const optionalCard = allStats.find(s => !mandatoryCards.includes(s.id))!.id;
           orderedCardIds = [...mandatoryCards, optionalCard];
         }
      }
      
      const cardsToShow = orderedCardIds.map(id => {
          const cardInfo = allStats.find(s => s.id === id);
          if (!cardInfo) return null;
          
          let value: any = 0;
          if (id === 'lucro') value = currentData.totalLucro;
          else if (id === 'ganho') value = currentData.totalGanho;
          else if (id === 'combustivel') value = currentData.totalCombustivel;
          else if (id === 'viagens') value = currentData.totalViagens;
          else if (id === 'dias') value = currentData.diasTrabalhados;
          else if (id === 'mediaHoras') value = currentData.mediaHorasPorDia;
          else if (id === 'mediaKm') value = currentData.mediaKmPorDia;
          else if (id === 'ganhoHora') value = currentData.ganhoPorHora;
          else if (id === 'ganhoKm') value = currentData.ganhoPorKm;
          else if (id === 'eficiencia') value = currentData.eficiencia;
          else if (id === 'kmRodados') value = currentData.totalKm;
          else if (id === 'horasTrabalhadas') value = currentData.totalHoras;
          else value = (currentData as any)[id] ?? currentData.maintenance[id as keyof typeof currentData.maintenance] ?? 0;

          return { ...cardInfo, value };
      }).filter(Boolean) as (typeof allStats[0] & { value: number })[];


      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cardsToShow.map(stat => <StatsCard key={stat.id} {...stat} isPreview={false} />)}
              {!isPremium && cardsToShow.length < 4 && (
                   <Link href="/configuracoes/layout-personalizado" passHref>
                      <Card className="p-4 h-full flex flex-col items-center justify-center border-dashed hover:bg-muted/50 transition-colors">
                        <CardContent className="p-0 text-center">
                            <PlusCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                            <p className="text-sm font-semibold">Adicionar Card</p>
                        </CardContent>
                      </Card>
                  </Link>
              )}
          </div>

          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg">Meta de Lucro ({period ? periodMap[period] : ''})</CardTitle>
              </CardHeader>
              <CardContent>
                <GoalProgress progress={(currentData.meta.target > 0 ? (currentData.totalLucro / currentData.meta.target) * 100 : 0)} target={currentData.meta.target} current={currentData.totalLucro} />
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
          {!isPremium && (
              <Link href="/configuracoes/layout-personalizado" passHref>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Adicionar outro Gráfico
                </Button>
            </Link>
          )}
          </>
      )
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center w-full">
        <h1 className="text-4xl font-bold font-headline">Uber Cash</h1>
        <p className="text-muted-foreground">Sua rota certa para o sucesso.</p>
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
