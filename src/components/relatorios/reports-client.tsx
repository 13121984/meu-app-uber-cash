
"use client";

import { useState, useMemo, useEffect } from 'react';
import { BarChart, PieChartIcon, Fuel, Car, DollarSign } from 'lucide-react';
import { ReportsFilter, type ReportFilterValues } from './reports-filter';
import { WorkDay, getReportData, ReportData } from '@/services/work-day.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EarningsPieChart } from '@/components/dashboard/earnings-chart';
import { EarningsBarChart } from '@/components/dashboard/earnings-bar-chart';
import { TripsBarChart } from '@/components/dashboard/trips-bar-chart';
import { FuelBarChart } from './fuel-bar-chart';

interface ReportsClientProps {
  initialData: WorkDay[];
}

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
        <div className={`p-3 rounded-full bg-gradient-to-tr ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
    </div>
);


export function ReportsClient({ initialData }: ReportsClientProps) {
  const [filters, setFilters] = useState<ReportFilterValues | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  useEffect(() => {
    if (filters) {
      getReportData(initialData, filters).then(data => {
        setReportData(data);
      });
    }
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
      
      {!reportData || reportData.diasTrabalhados === 0 ? (
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
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                   <StatCard title="Lucro Líquido" value={formatCurrency(reportData.totalLucro)} icon={DollarSign} color="from-green-500 to-green-400" />
                   <StatCard title="Ganhos (Bruto)" value={formatCurrency(reportData.totalGanho)} icon={Car} color="from-blue-500 to-blue-400" />
                   <StatCard title="Gastos (Combustível + Extras)" value={formatCurrency(reportData.totalGastos)} icon={Fuel} color="from-red-500 to-red-400" />
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Composição do Lucro */}
                <Card className="lg:col-span-1">
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
                
                {/* Ganhos por Categoria */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Ganhos por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EarningsBarChart data={reportData.earningsByCategory} />
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid lg:grid-cols-2 gap-8">
                {/* Viagens por Categoria */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Viagens por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TripsBarChart data={reportData.tripsByCategory} />
                    </CardContent>
                </Card>
                
                {/* Gastos de Combustível */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Gastos com Combustível</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FuelBarChart data={reportData.fuelExpenses} />
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

    </div>
  );
}
