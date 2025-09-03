"use client"

import React, { useState } from "react"
import { DollarSign, Fuel, Gauge, Hourglass, Map, PlusCircle, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { EarningsPieChart } from "./earnings-chart"
import Link from "next/link"

const mockData = {
  hoje: {
    totalGanho: 150.75,
    totalLucro: 85.25,
    totalCombustivel: 55.50,
    totalExtras: 10.00,
    diasTrabalhados: 1,
    totalKm: 120,
    totalHoras: 6.5,
    totalViagens: 15,
    meta: { target: 200, period: "diária" },
  },
  semana: {
    totalGanho: 850.40,
    totalLucro: 510.90,
    totalCombustivel: 299.50,
    totalExtras: 40.00,
    diasTrabalhados: 5,
    totalKm: 750,
    totalHoras: 40,
    totalViagens: 102,
    meta: { target: 1000, period: "semanal" },
  },
  mes: {
    totalGanho: 3800.00,
    totalLucro: 2450.50,
    totalCombustivel: 1199.50,
    totalExtras: 150.00,
    diasTrabalhados: 22,
    totalKm: 3100,
    totalHoras: 180,
    totalViagens: 450,
    meta: { target: 4000, period: "mensal" },
  },
}

type Period = "hoje" | "semana" | "mes"

export function DashboardClient() {
  const [period, setPeriod] = useState<Period>("hoje")
  const data = mockData[period]

  const stats = [
    { title: "Total Ganho", value: data.totalGanho, icon: DollarSign, isCurrency: true },
    { title: "Total Lucro", value: data.totalLucro, icon: DollarSign, isCurrency: true, positive: true },
    { title: "Total Combustível", value: data.totalCombustivel, icon: Fuel, isCurrency: true, negative: true },
    { title: "Despesas Extras", value: data.totalExtras, icon: Wrench, isCurrency: true, negative: true },
    { title: "Total KM", value: data.totalKm, icon: Map, unit: "km" },
    { title: "Total Horas", value: data.totalHoras, icon: Hourglass, unit: "h" },
  ]

  const progress = (data.totalLucro / data.meta.target) * 100
  
  const chartData = [
    { name: 'Lucro', value: data.totalLucro, fill: 'hsl(var(--chart-1))', totalGanho: data.totalGanho },
    { name: 'Combustível', value: data.totalCombustivel, fill: 'hsl(var(--chart-2))', totalGanho: data.totalGanho },
    { name: 'Extras', value: data.totalExtras, fill: 'hsl(var(--chart-3))', totalGanho: data.totalGanho },
  ]

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
            <EarningsPieChart data={chartData} />
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
