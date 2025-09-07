
"use client";

import { useMemo, useState, useTransition } from 'react';
import { BarChart, Fuel, Car, DollarSign, Map, TrendingUp, Clock, Zap, Loader2, CalendarDays, Hourglass, Route, GripVertical } from 'lucide-react';
import { ReportsFilter } from './reports-filter';
import { getReportData, ReportData } from '@/services/summary.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportFilterValues } from '@/app/relatorios/actions';
import dynamic from 'next/dynamic';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";

const EarningsPieChart = dynamic(() => import('@/components/dashboard/earnings-chart').then(mod => mod.EarningsPieChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const EarningsBarChart = dynamic(() => import('@/components/dashboard/earnings-bar-chart').then(mod => mod.EarningsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const TripsBarChart = dynamic(() => import('@/components/dashboard/trips-bar-chart').then(mod => mod.TripsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const FuelBarChart = dynamic(() => import('./fuel-bar-chart').then(mod => mod.FuelBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const ProfitEvolutionChart = dynamic(() => import('./profit-evolution-chart').then(mod => mod.ProfitEvolutionChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const DailyTripsChart = dynamic(() => import('./daily-trips-chart').then(mod => mod.DailyTripsChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const AverageEarningPerTripChart = dynamic(() => import('./average-earning-per-trip-chart').then(mod => mod.AverageEarningPerTripChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const AverageEarningPerHourChart = dynamic(() => import('./average-earning-per-hour-chart').then(mod => mod.AverageEarningPerHourChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });

const DraggableCard = ({ id, title, description, children }: { id: string, title: string, description: string, children: React.ReactNode }) => {
    const controls = useDragControls();
    return (
        <Reorder.Item key={id} value={id} dragListener={false} dragControls={controls} className="bg-transparent">
             <Card className="w-full h-full">
                <CardHeader>
                    <div className="flex items-center gap-2">
                         <Button
                            variant="ghost"
                            size="icon"
                            onPointerDown={(e) => controls.start(e)}
                            className="cursor-grab p-1 h-8 w-8"
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        <div className="flex-1">
                            <CardTitle className="font-headline text-lg">{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </Reorder.Item>
    );
};

export function ReportsClient() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ReportFilterValues | null>(null);
  const [isLoading, startTransition] = useTransition();

  const [chartOrder, setChartOrder] = useState<string[]>([
    'profitEvolution',
    'earningsComposition',
    'profitabilityAnalysis',
    'earningsByCategory',
    'tripsByCategory',
    'dailyTrips',
    'fuelExpenses',
  ]);

  const handleApplyFilters = (filters: ReportFilterValues) => {
    setCurrentFilters(filters);
    startTransition(async () => {
      const data = await getReportData(filters);
      setReportData(data);
    });
  };

  const stats = useMemo(() => reportData ? [
    { title: "Lucro Líquido", value: reportData.totalLucro, icon: DollarSign, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-400" },
    { title: "Ganhos Brutos", value: reportData.totalGanho, icon: DollarSign, isCurrency: true, iconBg: "bg-primary/20", iconColor: "text-primary" },
    { title: "Viagens", value: reportData.totalViagens, icon: Car, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "Dias Trabalhados", value: reportData.diasTrabalhados, icon: CalendarDays, iconBg: "bg-sky-500/20", iconColor: "text-sky-400" },
    { title: "Média de Horas/Dia", value: reportData.mediaHorasPorDia, icon: Hourglass, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", precision: 2 },
    { title: "Média de KM/Dia", value: reportData.mediaKmPorDia, icon: Route, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    { title: "Ganho/Hora", value: reportData.ganhoPorHora, icon: TrendingUp, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-400", precision: 2 },
    { title: "Ganho/KM", value: reportData.ganhoPorKm, icon: TrendingUp, isCurrency: true, iconBg: "bg-blue-500/20", iconColor: "text-blue-400", precision: 2 },
    { title: "Eficiência Média", value: reportData.eficiencia, icon: Zap, unit: "km/L", iconBg: "bg-yellow-500/20", iconColor: "text-yellow-400", precision: 2 },
    { title: "Combustível", value: reportData.totalCombustivel, icon: Fuel, isCurrency: true, iconBg: "bg-red-500/20", iconColor: "text-red-400" },
    { title: "KM Rodados", value: reportData.totalKm, icon: Map, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    { title: "Horas Trabalhadas", value: reportData.totalHoras, icon: Clock, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", precision: 1 },
  ] : [], [reportData]);

  const chartComponents: { [key: string]: React.ReactNode } = useMemo(() => (reportData ? {
        profitEvolution: <DraggableCard id="profitEvolution" title="Evolução do Lucro no Período" description="Desempenho do lucro líquido dia a dia."><ProfitEvolutionChart data={reportData.profitEvolution} /></DraggableCard>,
        earningsComposition: <DraggableCard id="earningsComposition" title="Composição dos Ganhos" description="Distribuição do seu faturamento bruto."><div className="h-[350px]"><EarningsPieChart data={reportData.profitComposition} /></div></DraggableCard>,
        profitabilityAnalysis: <DraggableCard id="profitabilityAnalysis" title="Análise de Lucratividade por Categoria" description="Compare a eficiência de cada categoria."><div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4"><div className="space-y-2"><h3 className="font-semibold text-center">Ganho Médio por Viagem</h3><AverageEarningPerTripChart data={reportData.averageEarningPerTrip} /></div><div className="space-y-2"><h3 className="font-semibold text-center">Ganho Médio por Hora</h3><AverageEarningPerHourChart data={reportData.averageEarningPerHour} /></div></div></DraggableCard>,
        earningsByCategory: <DraggableCard id="earningsByCategory" title="Ganhos por Categoria" description=""><EarningsBarChart data={reportData.earningsByCategory} /></DraggableCard>,
        tripsByCategory: <DraggableCard id="tripsByCategory" title="Viagens por Categoria" description=""><TripsBarChart data={reportData.tripsByCategory} /></DraggableCard>,
        dailyTrips: <DraggableCard id="dailyTrips" title="Total de Viagens por Dia" description=""><DailyTripsChart data={reportData.dailyTrips} /></DraggableCard>,
        fuelExpenses: <DraggableCard id="fuelExpenses" title="Gastos com Combustível" description="Total gasto por tipo de combustível."><FuelBarChart data={reportData.fuelExpenses} /></DraggableCard>,
  } : {}), [reportData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!currentFilters) {
        return (
             <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
                <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Selecione um Período</h2>
                <p className="text-muted-foreground">Escolha uma das opções acima para gerar seu relatório.</p>
            </Card>
        )
    }

    if (!reportData || reportData.diasTrabalhados === 0) {
      return (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
            <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Nenhum dado encontrado</h2>
            <p className="text-muted-foreground">Não há registros para o período selecionado. Tente ajustar os filtros.</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg">Resumo do Período</CardTitle>
                  <CardDescription>
                      {reportData.diasTrabalhados} {reportData.diasTrabalhados === 1 ? 'dia trabalhado' : 'dias trabalhados'} no período selecionado.
                  </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                 {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                 ))}
              </CardContent>
          </Card>
          
          <Reorder.Group
            as="div"
            axis="y"
            values={chartOrder}
            onReorder={setChartOrder}
            className="space-y-4"
          >
              {chartOrder.map(id => chartComponents[id] ? chartComponents[id] : null)}
          </Reorder.Group>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportsFilter onApplyFilters={handleApplyFilters} isPending={isLoading} />
      {renderContent()}
    </div>
  );
}
