
"use client"

import React, { useState } from "react"
import { DollarSign, Fuel, Gauge, Hourglass, Map, PlusCircle, Wrench, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { EarningsPieChart } from "./earnings-chart"
import Link from "next/link"
import { WorkDay } from "@/services/work-day.service"

export interface PeriodData {
  totalGanho: number;
  totalLucro: number;
  totalCombustivel: number;
  totalExtras: number;
  diasTrabalhados: number;
  totalKm: number;
  totalHoras: number;
  totalViagens: number;
  meta: { target: number; period: string };
}

export interface DashboardData {
  hoje: PeriodData;
  semana: PeriodData;
  mes: PeriodData;
}

interface DashboardClientProps {
  initialData: DashboardData;
}


type Period = "hoje" | "semana" | "mes"

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [period, setPeriod] = useState<Period>("hoje")
  const data = initialData[period]

  const stats = [
    { title: "Total Ganho", value: data.totalGanho, icon: DollarSign, isCurrency: true, positive: true },
    { title: "Total Lucro", value: data.totalLucro, icon: DollarSign, isCurrency: true, positive: true },
    { title: "Total Combustível", value: data.totalCombustivel, icon: Fuel, isCurrency: true, negative: true },
    { title: "Total KM", value: data.totalKm, icon: Map, unit: "km", color: "text-blue-500" },
    { title: "Total Horas", value: data.totalHoras, icon: Hourglass, unit: "h", color: "text-amber-500" },
    { title: "Dias Trabalhados", value: data.diasTrabalhados, icon: CalendarDays, color: "text-indigo-500" },
  ]

  const progress = data.meta.target > 0 ? (data.totalLucro / data.meta.target) * 100 : 0;
  
  const chartData = [
    { name: 'Lucro Líquido', value: data.totalLucro, fill: 'hsl(var(--chart-1))', totalGanho: data.totalGanho },
    { name: 'Combustível', value: data.totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho: data.totalGanho },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Seu resumo de performance.</p>
        </div>
        <Link href="/registrar" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Dia
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="hoje" onValueChange={(value) => setPeriod(value as Period)}>
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="mes">Mês</TabsTrigger>
        </TabsList>
        <TabsContent value="hoje" />
        <TabsContent value="semana" />
        <TabsContent value="mes" />
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Composição dos Ganhos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
                <EarningsPieChart data={chartData} />
            ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    Sem dados para exibir no gráfico.
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Meta {data.meta.period}</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalProgress progress={progress} target={data.meta.target} current={data.totalLucro} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
