
"use client";

import { Card } from "@/components/ui/card";
import { PlusCircle, LineChart, Wrench, Target, Settings, History, Calendar, LayoutDashboard, BarChart, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { DailySummaryCard } from "./daily-summary-card";
import type { PeriodData } from "../dashboard/dashboard-client";
import { ShiftPerformance } from "./shift-performance";
import { getTodayData } from "@/services/work-day.service";
import { Skeleton } from "../ui/skeleton";

const mainActions = [
  { href: "/registrar/today", label: "Registrar Hoje", icon: PlusCircle, iconColor: "text-blue-500" },
  { href: "/registrar/other-day", label: "Registrar Outro Dia", icon: Calendar, iconColor: "text-teal-500" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, iconColor: "text-yellow-500" },
  { href: "/gerenciamento", label: "Gerenciar", icon: History, iconColor: "text-orange-500" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart, iconColor: "text-indigo-500" },
  { href: "/manutencao", label: "Manutenção", icon: Wrench, iconColor: "text-red-500" },
  { href: "/metas", label: "Metas", icon: Target, iconColor: "text-green-500" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, iconColor: "text-purple-500" },
];

const ActionButton = ({ href, label, icon: Icon, iconColor }: typeof mainActions[0]) => (
    <Link href={href} passHref>
        <Card className="group w-full h-32 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-primary">
            <Icon className={`h-8 w-8 ${iconColor} transition-colors group-hover:text-primary-foreground`} />
            <span className="font-semibold text-center text-foreground transition-colors group-hover:text-primary-foreground">{label}</span>
        </Card>
    </Link>
)

const DailySummarySkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Skeleton className="h-[500px] w-full" />
        </div>
        <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full" />
        </div>
    </div>
);


export function HomeClient() {
  const [todayData, setTodayData] = useState<PeriodData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const data = await getTodayData();
            setTodayData(data);
        } catch (error) {
            console.error("Failed to load today's data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
            <h1 className="text-5xl font-bold font-headline text-foreground">Uber Cash</h1>
            <p className="text-muted-foreground text-lg">Bem-vindo ao seu painel diário.</p>
        </div>

        <div className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">Ações Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mainActions.map((action) => (
                    <ActionButton key={action.href} {...action} />
                ))}
            </div>
        </div>

        <div className="space-y-4">
             <h2 className="text-2xl font-semibold font-headline">Resumo do Dia</h2>
             {isLoading || !todayData ? (
                 <DailySummarySkeleton />
             ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <DailySummaryCard data={todayData} />
                    </div>
                    <div className="lg:col-span-2">
                        <ShiftPerformance performance={todayData.performanceByShift} />
                    </div>
                 </div>
             )}
        </div>
    </div>
  );
}
