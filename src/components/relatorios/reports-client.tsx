
"use client";

import { useState, useMemo, useEffect } from 'react';
import { BarChart, PieChartIcon, Fuel, Car, DollarSign, Map, TrendingUp, Clock, Zap } from 'lucide-react';
import { ReportsFilter, type ReportFilterValues } from './reports-filter';
import { WorkDay, getReportData, ReportData } from '@/services/work-day.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EarningsPieChart } from '@/components/dashboard/earnings-chart';
import { EarningsBarChart } from '@/components/dashboard/earnings-bar-chart';
import { TripsBarChart } from '@/components/dashboard/trips-bar-chart';
import { FuelBarChart } from './fuel-bar-chart';
import { ProfitEvolutionChart } from './profit-evolution-chart';
import { DailyTripsChart } from './daily-trips-chart';


interface ReportsClientProps {
  initialData: WorkDay[];
}

const StatCard = ({ title, value, icon: Icon, color, isCurrency = false, unit = '', precision = 0 }: { title: string, value: number, icon: React.ElementType, color: string, isCurrency?: boolean, unit?: string, precision?: number }) => {
    const formattedValue = isCurrency
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: precision, maximumFractionDigits: precision })
        : `${value.toFixed(precision)}${unit ? ` ${unit}`: ''}`

    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-xl font-bold text-foreground">{formattedValue}</p>
                <p className="text-muted-foreground text-sm">{title}</p>
            </div>
        </div>
    );
};


export function ReportsClient({ initialData }: ReportsClientProps) {
  const [filters, setFilters] = useState<ReportFilterValues>({ type: 'thisMonth' });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    getReportData(initialData, filters).then(data => {
        setReportData(data);
        setIsLoading(false);
    });
  }, [initialData, filters]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <BarChart className="w-8 h-8 text-primary" />
          Relatórios
        </h1>
      </div>

      <ReportsFilter onFilterChange={setFilters} />
      
      {isLoading ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
            <BarChart className="w-16 h-16 text-muted-foreground mb-4 animate-pulse" />
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
        <div className="space-y-8">

            {/* Resumo do Período */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Resumo do Período</CardTitle>
                    <CardDescription>
                        {reportData.diasTrabalhados} {reportData.diasTrabalhados === 1 ? 'dia trabalhado' : 'dias trabalhados'} no período selecionado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <StatCard title="Lucro Líquido" value={reportData.totalLucro} icon={DollarSign} color="bg-green-500/80" isCurrency />
                   <StatCard title="Ganhos (Bruto)" value={reportData.totalGanho} icon={DollarSign} color="bg-green-500/80" isCurrency />
                   <StatCard title="Viagens" value={reportData.totalViagens} icon={Car} color="bg-blue-500/80" />
                   <StatCard title="KM Rodados" value={reportData.totalKm} icon={Map} color="bg-purple-500/80" unit="km" />
                   <StatCard title="Horas" value={reportData.totalHoras} icon={Clock} color="bg-orange-500/80" unit="h" precision={1} />
                   <StatCard title="Ganho/Hora" value={reportData.ganhoPorHora} icon={TrendingUp} color="bg-green-500/80" isCurrency precision={2} />
                   <StatCard title="Ganho/KM" value={reportData.ganhoPorKm} icon={TrendingUp} color="bg-blue-500/80" isCurrency precision={2} />
                   <StatCard title="Eficiência Média" value={reportData.eficiencia} icon={Zap} color="bg-yellow-500/80" unit="km/L" precision={2} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Composição do Lucro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EarningsPieChart data={reportData.profitComposition} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Evolução do Lucro no Período</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProfitEvolutionChart data={reportData.profitEvolution} />
                </CardContent>
            </Card>

             <div className="grid lg:grid-cols-2 gap-8">
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
            </div>
            
             <div className="grid lg:grid-cols-2 gap-8">
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
        </div>
      )}

    </div>
  );
}
