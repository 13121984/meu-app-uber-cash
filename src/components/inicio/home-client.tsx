
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart, Wrench, Target, Settings, History } from "lucide-react";
import Link from "next/link";
import { PeriodData } from "../dashboard/dashboard-client";
import { GoalProgress } from "../dashboard/goal-progress";

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
  const progress = todayData.meta.target > 0 ? (todayData.totalLucro / todayData.meta.target) * 100 : 0;

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

      <Card>
        <CardHeader>
          <CardTitle>Performance de Hoje</CardTitle>
          <CardDescription>Resumo dos seus ganhos e metas para o dia atual.</CardDescription>
        </CardHeader>
        <CardContent>
            {todayData.diasTrabalhados > 0 ? (
                <>
                    <GoalProgress 
                        progress={progress}
                        target={todayData.meta.target}
                        current={todayData.totalLucro}
                    />
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="font-bold text-lg text-green-500">{todayData.totalLucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{todayData.totalGanho.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            <p className="text-sm text-muted-foreground">Ganhos Brutos</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{todayData.totalViagens}</p>
                            <p className="text-sm text-muted-foreground">Viagens</p>
                        </div>
                         <div>
                            <p className="font-bold text-lg">{todayData.totalKm} km</p>
                            <p className="text-sm text-muted-foreground">KM Rodados</p>
                        </div>
                    </div>
                </>
            ): (
                 <div className="text-center py-10 text-muted-foreground">
                    <p className="font-semibold">Nenhum registro encontrado para hoje.</p>
                    <p className="text-sm mt-2">Clique em "Registrar Dia Atual" para começar.</p>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
