
"use client";

import { useState, useMemo, useEffect, useTransition } from 'react';
import { BarChart, PieChartIcon, Fuel, Car, DollarSign, Map, TrendingUp, Clock, Zap, Wrench, Loader2 } from 'lucide-react';
import { ReportsFilter } from './reports-filter';
import { WorkDay, getReportData, ReportData } from '@/services/work-day.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportFilterValues } from '@/app/relatorios/actions';
import dynamic from 'next/dynamic';

const EarningsPieChart = dynamic(() => import('@/components/dashboard/earnings-chart').then(mod => mod.EarningsPieChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const EarningsBarChart = dynamic(() => import('@/components/dashboard/earnings-bar-chart').then(mod => mod.EarningsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const TripsBarChart = dynamic(() => import('@/components/dashboard/trips-bar-chart').then(mod => mod.TripsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const FuelBarChart = dynamic(() => import('./fuel-bar-chart').then(mod => mod.FuelBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const ProfitEvolutionChart = dynamic(() => import('./profit-evolution-chart').then(mod => mod.ProfitEvolutionChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const DailyTripsChart = dynamic(() => import('./daily-trips-chart').then(mod => mod.DailyTripsChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });


interface ReportsClientProps {
  initialData: WorkDay[];
}

const StatCard = ({ title, value, icon: Icon, color, isCurrency = false, unit = '', precision = 0 }: { title: string, value: number, icon: React.ElementType, color: string, isCurrency?: boolean, unit?: string, precision?: number }) => {
    const formattedValue = isCurrency
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: precision, maximumFractionDigits: precision })
        : `${value.toFixed(precision)}${unit ? ` ${unit}`: ''}`

    return (
        <Card className="bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedValue}</div>
            </CardContent>
        </Card>
    );
};


export function ReportsClient({ initialData }: ReportsClientProps) {
  const [filters, setFilters] = useState<ReportFilterValues>({ type: 'thisMonth' });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isPending, startTransition] = useTransition();
  const isLoading = isPending || !reportData;

  useEffect(() => {
    startTransition(async () => {
        const data = await getReportData(initialData, filters);
        setReportData(data);
    });
  }, [initialData, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <BarChart className="w-8 h-8 text-primary" />
          Relatórios
        </h1>
      </div>

      <ReportsFilter 
        onFilterChange={setFilters} 
        initialFilters={filters}
        isPending={isPending}
      />
      
      {isLoading ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
            <Loader2 className="w-16 h-16 text-muted-foreground mb-4 animate-spin" />
            <h2 className="text-xl font-semibold">Carregando dados...</h2>
            <p className="text-muted-foreground">Aguarde enquanto processamos as informações.</p>
        </Card>
      ) : !reportData || reportData.diasTrabalhados === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
            <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Nenhum dado encontrado</h2>
            <p className="text-muted-foreground">Não há registros para o período selecionado. Tente ajustar os filtros.</p>
        </Card>
      ) : (
        <div className="space-y-4">

            {/* Resumo do Período */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Resumo do Período</CardTitle>
                    <CardDescription>
                        {reportData.diasTrabalhados} {reportData.diasTrabalhados === 1 ? 'dia trabalhado' : 'dias trabalhados'} no período selecionado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   <StatCard title="Lucro Líquido" value={reportData.totalLucro} icon={DollarSign} color="text-green-500" isCurrency />
                   <StatCard title="Ganhos (Bruto)" value={reportData.totalGanho} icon={DollarSign} color="text-green-500" isCurrency />
                   <StatCard title="Gastos Totais" value={reportData.totalGastos} icon={DollarSign} color="text-red-500" isCurrency />
                   <StatCard title="Manutenção" value={reportData.profitComposition.find(c => c.name === 'Manutenção')?.value || 0} icon={Wrench} color="text-orange-500" isCurrency />
                   <StatCard title="Viagens" value={reportData.totalViagens} icon={Car} color="text-blue-500" />
                   <StatCard title="KM Rodados" value={reportData.totalKm} icon={Map} color="text-purple-500" unit="km" />
                   <StatCard title="Horas" value={reportData.totalHoras} icon={Clock} color="text-orange-500" unit="h" precision={1} />
                   <StatCard title="Ganho/Hora" value={reportData.ganhoPorHora} icon={TrendingUp} color="text-green-500" isCurrency precision={2} />
                   <StatCard title="Ganho/KM" value={reportData.ganhoPorKm} icon={TrendingUp} color="text-blue-500" isCurrency precision={2} />
                   <StatCard title="Eficiência Média" value={reportData.eficiencia} icon={Zap} color="text-yellow-500" unit="km/L" precision={2} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Composição dos Ganhos
                    </CardTitle>
                     <CardDescription>
                        Visualização da distribuição do seu faturamento bruto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <EarningsPieChart data={reportData.profitComposition} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Evolução do Lucro no Período</CardTitle>
                     <CardDescription>
                        Desempenho do lucro líquido dia a dia.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfitEvolutionChart data={reportData.profitEvolution} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Ganhos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <EarningsBarChart data={reportData.earningsByCategory} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Viagens por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <TripsBarChart data={reportData.tripsByCategory} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Gastos com Combustível</CardTitle>
                </CardHeader>
                <CardContent>
                    <FuelBarChart data={reportData.fuelExpenses} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Total de Viagens por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                    <DailyTripsChart data={reportData.dailyTrips} />
                </CardContent>
            </Card>
        </div>
      )}

    </div>
  );
}
