
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, BarChart, Wrench, Target, Settings, History, Calendar, Clock, BarChart3, LineChart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DailySummaryCard } from "./daily-summary-card";
import type { PeriodData } from "../dashboard/dashboard-client";


const mainActions = [
  { href: "/registrar/today", label: "Registrar Hoje", icon: Clock, bgColor: "bg-primary/5" },
  { href: "/registrar/other-day", label: "Registrar Outro Dia", icon: Calendar, bgColor: "bg-blue-500/5" },
  { href: "/dashboard", label: "Performance", icon: LineChart, bgColor: "bg-yellow-500/5" },
  { href: "/manutencao", label: "Manutenção", icon: Wrench, bgColor: "bg-red-500/5" },
  { href: "/metas", label: "Metas", icon: Target, bgColor: "bg-green-500/5" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, bgColor: "bg-gray-500/5" },
];


const ActionButton = ({ href, label, icon: Icon, bgColor }: typeof mainActions[0]) => (
    <Link href={href} passHref>
        <Card className="group w-full h-36 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-primary">
            <Icon className="h-10 w-10 text-foreground/80 transition-colors group-hover:text-primary-foreground" />
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
            <h1 className="text-5xl font-bold font-headline text-foreground">Uber Cash</h1>
            <p className="text-muted-foreground text-lg">Bem-vindo ao seu painel diário.</p>
        </div>

        <div className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">Ações Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    {/* Placeholder for future charts */}
                    <Card className="h-full min-h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Gráficos em breve...</p>
                    </Card>
                </div>
             </div>
        </div>
    </div>
  );
}
