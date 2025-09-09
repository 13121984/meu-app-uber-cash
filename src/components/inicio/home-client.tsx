
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Wrench, Target, Settings, History, Calendar, LayoutDashboard, BarChart, Calculator, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { DailySummaryCard } from "./daily-summary-card";
import { ShiftPerformance } from "./shift-performance";
import { getReportData, PeriodData } from "@/services/summary.service";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { MaintenanceReminderCard } from "./maintenance-reminder-card";
import { getMaintenanceRecords } from "@/services/maintenance.service";
import { useAuth } from '@/contexts/auth-context';


const mainActions = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, iconColor: "text-yellow-500" },
  { href: "/gerenciamento", label: "Gerenciar", icon: History, iconColor: "text-orange-500" },
  { href: "/taximetro", label: "Taxímetro", icon: Calculator, iconColor: "text-teal-500" },
  { href: "/manutencao", label: "Manutenção", icon: Wrench, iconColor: "text-red-500" },
  { href: "/metas", label: "Metas", icon: Target, iconColor: "text-green-500" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, iconColor: "text-purple-500" },
];

const ActionButton = ({ href, label, icon: Icon, iconColor }: typeof mainActions[0]) => (
    <Link href={href} passHref>
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full h-full"
        >
            <Card className="group w-full h-32 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:bg-primary">
                <Icon className={`h-8 w-8 ${iconColor} transition-colors group-hover:text-primary-foreground`} />
                <span className="font-semibold text-center text-foreground transition-colors group-hover:text-primary-foreground">{label}</span>
            </Card>
        </motion.div>
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
  const { user } = useAuth();
  const [todayData, setTodayData] = useState<PeriodData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    };

    async function loadData() {
        try {
            const data = await getReportData(user!.id, { type: 'today' });
            setTodayData(data as PeriodData);
        } catch (error) {
            console.error("Failed to load today's data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
            <h1 className="text-5xl font-bold font-headline text-foreground">Uber Cash</h1>
            <p className="text-muted-foreground text-lg">Sua rota certa para o sucesso.</p>
        </div>

        <MaintenanceReminderCard />
        
        {/* Card de Registro Unificado */}
        <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold font-headline flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-green-500" />
                        Registrar Receitas
                    </h2>
                    <p className="text-muted-foreground">Adicione seus ganhos e despesas para acompanhar sua performance.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Link href="/registrar/today" className="w-full">
                        <Button className="w-full" variant="secondary">
                            <Calendar className="mr-2 h-4 w-4" />
                            Registrar Hoje
                        </Button>
                    </Link>
                     <Link href="/registrar/other-day" className="w-full">
                        <Button className="w-full" variant="secondary">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Outro Dia
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">Ações Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mainActions.map((action) => (
                    <ActionButton key={action.href} {...action} />
                ))}
            </div>
        </div>

        <div className="space-y-4">
             <h2 className="text-2xl font-semibold font-headline">Resumo do Dia</h2>
             {isLoading ? (
                 <DailySummarySkeleton />
             ) : !todayData || todayData.diasTrabalhados === 0 ? (
                <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
                    <div className="text-center text-muted-foreground">
                        <BarChart className="mx-auto h-12 w-12" />
                        <p className="mt-4 font-semibold">Nenhum dado registrado para hoje.</p>
                        <p className="text-sm">Clique em "Registrar Hoje" para começar.</p>
                    </div>
                </Card>
             ) : (
                 <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="lg:col-span-1">
                        <DailySummaryCard data={todayData} />
                    </div>
                    <div className="lg:col-span-2">
                        <ShiftPerformance performance={todayData.performanceByShift} />
                    </div>
                 </motion.div>
             )}
        </div>
    </div>
  );
}
