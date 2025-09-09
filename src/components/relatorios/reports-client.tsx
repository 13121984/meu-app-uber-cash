

"use client";

import React, { useState, useTransition, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ReportsFilter } from './reports-filter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Info, PlusCircle, Wrench, LineChart, PieChart, BarChart3, CandlestickChart, Fuel, Lock } from 'lucide-react';
import { ReportData, getReportData } from '@/services/summary.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '../ui/button';
import { allCharts, mandatoryCharts, allStats, mandatoryCards } from '@/lib/dashboard-items';
import { motion } from 'framer-motion';

const StatsCard = dynamic(() => import('../dashboard/stats-card').then(mod => mod.StatsCard), { ssr: false });
const EarningsPieChart = dynamic(() => import('../dashboard/earnings-chart').then(mod => mod.EarningsPieChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const ProfitEvolutionChart = dynamic(() => import('./profit-evolution-chart').then(mod => mod.ProfitEvolutionChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const EarningsBarChart = dynamic(() => import('../dashboard/earnings-bar-chart').then(mod => mod.EarningsBarChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const TripsBarChart = dynamic(() => import('../dashboard/trips-bar-chart').then(mod => mod.TripsBarChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const MaintenanceSummary = dynamic(() => import('../dashboard/maintenance-summary').then(mod => mod.MaintenanceSummary), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const FuelBarChart = dynamic(() => import('./fuel-bar-chart').then(mod => mod.FuelBarChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const DailyTripsChart = dynamic(() => import('./daily-trips-chart').then(mod => mod.DailyTripsChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const AverageEarningPerHourChart = dynamic(() => import('./average-earning-per-hour-chart').then(mod => mod.AverageEarningPerHourChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const AverageEarningPerTripChart = dynamic(() => import('./average-earning-per-trip-chart').then(mod => mod.AverageEarningPerTripChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });


const chartComponentMap: { [key: string]: React.ComponentType<any> } = {
  earningsComposition: EarningsPieChart,
  profitEvolution: ProfitEvolutionChart,
  earningsByCategory: EarningsBarChart,
  tripsByCategory: TripsBarChart,
  maintenance: MaintenanceSummary,
  fuelExpenses: FuelBarChart,
  dailyTrips: DailyTripsChart,
  averageEarningPerHour: AverageEarningPerHourChart,
  averageEarningPerTrip: AverageEarningPerTripChart,
};

export function ReportsClient() {
  const { user, isPro, isAutopilot } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilterValues | null>(null);
  const [isPending, startTransition] = useTransition();
  const reportContentRef = useRef<HTMLDivElement>(null);


  const handleApplyFilters = useCallback((newFilters: ReportFilterValues) => {
    if (!user) return;
    setFilters(newFilters);
    startTransition(async () => {
      const reportData = await getReportData(user.id, newFilters);
      setData(reportData);
    });
  }, [user]);
  

  const getChartData = (reportData: ReportData, chartId: string) => {
    switch (chartId) {
        case 'earningsComposition': return reportData.profitComposition;
        case 'profitEvolution': return reportData.profitEvolution;
        case 'earningsByCategory': return reportData.earningsByCategory;
        case 'tripsByCategory': return reportData.tripsByCategory;
        case 'maintenance': return reportData.maintenance;
        case 'fuelExpenses': return reportData.fuelExpenses;
        case 'dailyTrips': return reportData.dailyTrips;
        case 'averageEarningPerHour': return reportData.averageEarningPerHour;
        case 'averageEarningPerTrip': return reportData.averageEarningPerTrip;
        default: return [];
    }
  }

  const renderContent = () => {
    if (isPending) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!data || data.diasTrabalhados === 0) {
        return (
            <Card className="mt-6 flex flex-col items-center justify-center p-12 text-center border-dashed">
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Nenhum dado encontrado</h3>
                <p className="text-muted-foreground">Não há registros para o período selecionado. Tente ajustar os filtros.</p>
            </Card>
        );
    }
    
    let orderedCardIds: string[];
    if (isPro) {
      orderedCardIds = user?.preferences?.dashboardCardOrder?.length ? user.preferences.dashboardCardOrder : allStats.map(s => s.id);
    } else {
      orderedCardIds = mandatoryCards;
    }
      
    const cardsToShow = orderedCardIds.map(id => {
        const cardInfo = allStats.find(s => s.id === id);
        if (!cardInfo) return null;
        
        let value: any = 0;
        if (id === 'lucro') value = data.totalLucro;
        else if (id === 'ganho') value = data.totalGanho;
        else if (id === 'combustivel') value = data.totalCombustivel;
        else if (id === 'viagens') value = data.totalViagens;
        else if (id === 'dias') value = data.diasTrabalhados;
        else if (id === 'mediaHoras') value = data.mediaHorasPorDia;
        else if (id === 'mediaKm') value = data.mediaKmPorDia;
        else if (id === 'ganhoHora') value = data.ganhoPorHora;
        else if (id === 'ganhoKm') value = data.ganhoPorKm;
        else if (id === 'eficiencia') value = data.eficiencia;
        else if (id === 'kmRodados') value = data.totalKm;
        else if (id === 'horasTrabalhadas') value = data.totalHoras;
        else value = (data as any)[id] ?? data.maintenance[id as keyof typeof data.maintenance] ?? 0;

        return { ...cardInfo, value };
    }).filter(Boolean) as (typeof allStats[0] & { value: number })[];
    
    let chartsToShowIds: string[];
    if (isAutopilot) {
        chartsToShowIds = user?.preferences?.reportChartOrder?.length ? user.preferences.reportChartOrder : allCharts.map(c => c.id);
    } else if (isPro) {
        const proCharts = mandatoryCharts;
        const savedProOrder = user?.preferences?.reportChartOrder?.filter(id => proCharts.includes(id)) || [];
        chartsToShowIds = [...new Set([...savedProOrder, ...proCharts])];
    } else {
        chartsToShowIds = mandatoryCharts;
    }
    const chartsToShow = chartsToShowIds.map(id => allCharts.find(c => c.id === id)).filter(Boolean);

    return (
        <motion.div 
            ref={reportContentRef} 
            className="space-y-6 mt-6 bg-background p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cardsToShow.map(stat => <StatsCard key={stat.id} {...stat} isPreview={false} />)}
                 {!isAutopilot && (
                   <Link href="/configuracoes/layout-personalizado" passHref>
                      <Card className="p-4 h-full flex flex-col items-center justify-center border-dashed hover:bg-muted/50 transition-colors">
                        <CardContent className="p-0 text-center">
                            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                            <p className="text-sm font-semibold">Adicionar Card</p>
                             <p className="text-xs text-muted-foreground">Exclusivo Autopilot</p>
                        </CardContent>
                      </Card>
                  </Link>
              )}
            </div>
            {chartsToShow.map(chart => {
              if (!chart) return null;
              const ChartComponent = chartComponentMap[chart.id];
              if (!ChartComponent) return null;
              
              const chartData = getChartData(data, chart.id);
              if(!chartData || (Array.isArray(chartData) && chartData.length === 0)) return null;

              return (
                  <motion.div
                    key={chart.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card>
                        <CardHeader>
                        <CardTitle className="font-headline text-lg">{chart.title}</CardTitle>
                        <CardDescription>{chart.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartComponent key={`${chart.id}-${filters?.type}`} data={chartData} />
                        </CardContent>
                    </Card>
                  </motion.div>
              );
            })}
             {!isAutopilot && (
              <Link href="/configuracoes/layout-personalizado" passHref>
                <Button variant="outline" className="w-full">
                    <Lock className="mr-2 h-4 w-4"/>
                    Adicionar outro Gráfico (Exclusivo Autopilot)
                </Button>
            </Link>
          )}
        </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <ReportsFilter 
            onApplyFilters={handleApplyFilters} 
            isPending={isPending}
            reportContentRef={reportContentRef}
          />
        </CardContent>
      </Card>
      {renderContent()}
    </div>
  );
}
