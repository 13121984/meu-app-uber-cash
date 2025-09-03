
"use client"

import React, { useState } from "react"
import { DollarSign, Fuel, Map, Hourglass, TrendingUp, Clock, Car, Settings, Wrench, Zap, BarChart3, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { cn } from "@/lib/utils"
import { EarningsBarChart } from "./earnings-bar-chart"
import { TripsBarChart } from "./trips-bar-chart"
import { MaintenanceSummary } from "./maintenance-summary"

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
  eficiencia: number;
  earningsByCategory: EarningsByCategory[];
  tripsByCategory: TripsByCategory[];
  maintenance: MaintenanceData;
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
  const [period, setPeriod] = useState<Period>("mes")
  const data = initialData[period]

  const stats = [
    { title: "Lucro Líquido", value: data.totalLucro, icon: DollarSign, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-400" },
    { title: "Viagens", value: data.totalViagens, icon: Car, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "KM", value: data.totalKm, icon: Map, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    { title: "Horas", value: data.totalHoras, icon: Clock, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", precision: 1 },
    { title: "Ganho/Hora", value: data.ganhoPorHora, icon: TrendingUp, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-400", precision: 2 },
    { title: "Ganho/KM", value: data.ganhoPorKm, icon: TrendingUp, isCurrency: true, iconBg: "bg-blue-500/20", iconColor: "text-blue-400", precision: 2 },
    { title: "Eficiência", value: data.eficiencia, icon: Zap, unit: "km/L", iconBg: "bg-yellow-500/20", iconColor: "text-yellow-400", precision: 2 },
    { title: "Combustível", value: data.totalCombustivel, icon: Fuel, isCurrency: true, iconBg: "bg-red-500/20", iconColor: "text-red-400" },
  ]
  const periodMap = {
      hoje: "Hoje",
      semana: "Esta Semana",
      mes: "Este Mês"
  }
  const progress = data.meta.target > 0 ? (data.totalLucro / data.meta.target) * 100 : 0;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Painel de Controle</h1>
        </div>
         <div className="flex items-center gap-2">
            {(["hoje", "semana", "mes"] as Period[]).map(p => (
                 <Button 
                    key={p} 
                    variant={period === p ? "default" : "secondary"}
                    onClick={() => setPeriod(p)}
                    className={cn(
                        "rounded-full transition-all",
                        period === p ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    )}
                >
                    {periodMap[p]}
                </Button>
            ))}
        </div>
      </div>

      <Card className="bg-card border-border">
          <CardHeader>
              <CardTitle className="font-headline text-lg">Resumo de {periodMap[period]}</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalProgress progress={progress} target={data.meta.target} current={data.totalLucro} />
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {stats.map((stat) => (
                  <StatsCard key={stat.title} {...stat} />
                ))}
              </div>
          </CardContent>
        </Card>

      <MaintenanceSummary data={initialData.mes.maintenance} />

      <Card className="bg-card border-border">
          <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Análise do Mês
              </CardTitle>
              <CardDescription>
                Detalhes sobre o desempenho das suas corridas durante este mês.
              </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
             <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                  Ganhos por Categoria
                </h3>
                <EarningsBarChart data={initialData.mes.earningsByCategory} />
            </div>
             <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                  Viagens por Categoria
                </h3>
                <TripsBarChart data={initialData.mes.tripsByCategory} />
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
