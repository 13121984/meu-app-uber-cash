
"use client"

import React, { useState } from "react"
import { DollarSign, Fuel, Map, Hourglass, TrendingUp, Clock, Car, Settings, Wrench, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { GoalProgress } from "./goal-progress"
import { cn } from "@/lib/utils"

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
  eficiencia: number;
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
      semana: "Semana",
      mes: "Mês"
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
              <CardTitle className="font-headline text-lg">Mês Referência</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalProgress progress={progress} target={data.meta.target} current={data.totalLucro} />
          </CardContent>
        </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} subtitle={`/Este ${periodMap[period]}`} />
        ))}
      </div>

    </div>
  )
}
