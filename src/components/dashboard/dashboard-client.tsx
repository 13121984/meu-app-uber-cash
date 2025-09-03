
"use client"

import React, { useState } from "react"
import { DollarSign, Fuel, Map, Hourglass, CalendarDays, TrendingUp, Clock, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { EarningsPieChart } from "./earnings-chart"
import { EarningsBarChart } from "./earnings-bar-chart"
import { TripsBarChart } from "./trips-bar-chart"
import Link from "next/link"

export interface EarningsByCategory {
    name: string;
    total: number;
}

export interface TripsByCategory {
    name: string;
    total: number;
}

export interface PeriodData {
  totalGanho: number;
  totalLucro: number;
  totalCombustivel: number;
  totalExtras: number;
  diasTrabalhados: number;
  totalKm: number;
  totalHoras: number;
  ganhoPorHora: number;
  ganhoPorKm: number;
  totalViagens: number;
  earningsByCategory: EarningsByCategory[];
  tripsByCategory: TripsByCategory[];
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
    { title: "Ganho/Hora", value: data.ganhoPorHora, icon: Clock, isCurrency: true, color: "text-purple-500", precision: 2 },
    { title: "Ganho/KM", value: data.ganhoPorKm, icon: TrendingUp, isCurrency: true, color: "text-pink-500", precision: 2 },
  ]

  const progress = data.meta.target > 0 ? (data.totalLucro / data.meta.target) * 100 : 0;
  
  const pieChartData = [
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            {pieChartData.length > 0 ? (
                <EarningsPieChart data={pieChartData} />
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

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ganhos por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
             {data.earningsByCategory.length > 0 ? (
                <EarningsBarChart data={data.earningsByCategory} />
            ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Sem dados de ganhos para exibir.
                </div>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Viagens por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
             {data.tripsByCategory.length > 0 ? (
                <TripsBarChart data={data.tripsByCategory} />
            ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Sem dados de viagens para exibir.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
