
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart, Wrench, Target, Settings, History } from "lucide-react";
import Link from "next/link";
import { PeriodData } from "../dashboard/dashboard-client";
import { StatsCard } from "../dashboard/stats-card";
import { DollarSign, Map, Car, Clock, BarChart3, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ShiftPerformance } from "./shift-performance";


const EarningsBarChart = dynamic(() => import('../dashboard/earnings-bar-chart').then(mod => mod.EarningsBarChart), { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });
const EarningsPieChart = dynamic(() => import('../dashboard/earnings-chart').then(mod => mod.EarningsPieChart), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> });


const mainActions = [
  { href: "/registrar/today", label: "Registrar Dia Atual", icon: PlusCircle },
  { href: "/registrar/other-day", label: "Registrar Outro Dia", icon: History },
  { href: "/dashboard", label: "Acompanhar Performance", icon: BarChart, variant: "secondary" },
];

const secondaryActions = [
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/metas", label: "Planejamento", icon: Target },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

interface HomeClientProps {
  todayData: PeriodData;
}

export function HomeClient({ todayData }: HomeClientProps) {
  const stats = [
    { title: "Lucro do Dia", value: todayData.totalLucro, icon: DollarSign, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-400" },
    { title: "Ganhos do Dia", value: todayData.totalGanho, icon: DollarSign, isCurrency: true, iconBg: "bg-primary/20", iconColor: "text-primary" },
    { title: "Viagens", value: todayData.totalViagens, icon: Car, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "KM Rodados", value: todayData.totalKm, icon: Map, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    { title: "Horas", value: todayData.totalHoras, icon: Clock, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", precision: 1 },
  ]
  
  return (
    <div className="space-y-8">
      <div className="text-center w-full">
        <h1 className="text-4xl font-bold font-headline">Bem-vindo ao Uber Cash!</h1>
        <p className="text-muted-foreground">Seu assistente para maximizar seus ganhos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainActions.map((action) => (
          <Link key={action.href} href={action.href} passHref>
            <Button
              variant={action.variant as any || "default"}
              className="w-full h-24 text-lg justify-start p-6 gap-4"
            >
              <action.icon className="h-8 w-8" />
              <span>{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {secondaryActions.map((action) => (
             <Link key={action.href} href={action.href} passHref>
                <Button
                    variant="outline"
                    className="w-full h-16 justify-start p-4 gap-3"
                >
                    <action.icon className="h-6 w-6 text-primary" />
                    <span>{action.label}</span>
                </Button>
             </Link>
        ))}
      </div>

      {todayData.diasTrabalhados > 0 ? (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Resumo de Hoje</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {stats.map((stat) => (
                        <StatsCard key={stat.title} {...stat} />
                    ))}
                </CardContent>
            </Card>

            <ShiftPerformance performance={todayData.performanceByShift} />
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Análise de Hoje
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div>
                        <h3 className="font-semibold text-center mb-2">Ganhos por Categoria</h3>
                        <EarningsBarChart data={todayData.earningsByCategory} />
                    </div>
                     <div>
                        <h3 className="font-semibold text-center mb-2">Composição dos Ganhos</h3>
                        <EarningsPieChart data={todayData.profitComposition} />
                    </div>
                </CardContent>
            </Card>

        </div>
      ) : (
        <Card className="text-center p-8 border-dashed">
            <h3 className="text-xl font-semibold">Nenhum registro para hoje ainda</h3>
            <p className="text-muted-foreground">Comece registrando seu dia para ver suas estatísticas.</p>
        </Card>
      )}
    </div>
  );
}

