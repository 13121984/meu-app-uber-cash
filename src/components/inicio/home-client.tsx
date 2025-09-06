
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, LineChart, Wrench, Target, Settings, History, Calendar, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DailySummaryCard } from "./daily-summary-card";
import type { PeriodData } from "../dashboard/dashboard-client";
import { ShiftPerformance } from "./shift-performance";


const mainActions = [
  { href: "/registrar/today", label: "Registrar Hoje", icon: Clock, bgColor: "bg-primary/5", iconColor: "text-blue-500" },
  { href: "/registrar/other-day", label: "Registrar Outro Dia", icon: Calendar, bgColor: "bg-purple-500/5", iconColor: "text-purple-500" },
  { href: "/dashboard", label: "Performance", icon: LineChart, bgColor: "bg-yellow-500/5", iconColor: "text-yellow-500" },
  { href: "/manutencao", label: "Manutenção", icon: Wrench, bgColor: "bg-red-500/5", iconColor: "text-red-500" },
  { href: "/metas", label: "Metas", icon: Target, bgColor: "bg-green-500/5", iconColor: "text-green-500" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, bgColor: "bg-gray-500/5", iconColor: "text-gray-500" },
];


const ActionButton = ({ href, label, icon: Icon, iconColor }: Omit<typeof mainActions[0], 'bgColor'>) => (
    <Link href={href} passHref>
        <Card className="group w-full h-36 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-primary">
            <Icon className={`h-10 w-10 ${iconColor} transition-colors group-hover:text-primary-foreground`} />
            <span className="font-semibold text-center text-foreground transition-colors group-hover:text-primary-foreground">{label}</span>
        </Card>
    </Link>
)

interface HomeClientProps {
    todayData: PeriodData;
}


export function HomeClient({ todayData }: HomeClientProps) {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
            <h1 className="text-5xl font-bold font-headline text-foreground">Rota Certa</h1>
            <p className="text-muted-foreground text-lg">Bem-vindo ao seu painel diário.</p>
        </div>

        <div className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">Ações Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {mainActions.map((action) => (
                    <ActionButton key={action.href} {...action} />
                ))}
            </div>
        </div>

        <div className="space-y-4">
             <h2 className="text-2xl font-semibold font-headline">Resumo do Dia</h2>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <DailySummaryCard data={todayData} />
                </div>
                <div className="lg:col-span-2">
                    <ShiftPerformance performance={todayData.performanceByShift} />
                </div>
             </div>
        </div>
    </div>
  );
}
