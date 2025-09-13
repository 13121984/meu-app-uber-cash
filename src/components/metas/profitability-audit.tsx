
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { generateReportData, AverageEarningByCategory } from '@/services/summary.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, TrendingUp, TrendingDown, CheckCircle, BarChart3, Calendar, Award } from 'lucide-react';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Insight {
    bestDay: { date: string; profitPerHour: number; } | null;
    worstDay: { date: string; profitPerHour: number; } | null;
    bestApp: AverageEarningByCategory | null;
}

function InsightCard({ title, value, subValue, icon: Icon, color }: { title: string, value: string, subValue: string, icon: React.ElementType, color: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="font-bold text-lg">{value}</p>
                <p className="text-xs font-mono">{subValue}</p>
            </div>
        </div>
    )
}

function AuditSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
}

export function ProfitabilityAudit() {
    const { user } = useAuth();
    const [insights, setInsights] = useState<Insight | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        async function fetchInsights() {
            setIsLoading(true);
            try {
                // CORREÇÃO: Construir filtro explícito para o mês atual
                const now = new Date();
                const filters = {
                    type: 'specificMonth' as const,
                    month: getMonth(now),
                    year: getYear(now),
                };
                const report = await generateReportData(user!.id, filters);
                
                let bestDay: Insight['bestDay'] = null;
                let worstDay: Insight['worstDay'] = null;

                if(report.rawWorkDays.length > 0) {
                    const dailyPerformance = new Map<string, { earnings: number; hours: number }>();
                    
                    report.rawWorkDays.forEach(day => {
                        const dateKey = format(day.date, 'yyyy-MM-dd');
                        const dayData = dailyPerformance.get(dateKey) || { earnings: 0, hours: 0 };
                        
                        const dayEarnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
                        
                        dayData.earnings += dayEarnings;
                        dayData.hours += day.hours;
                        
                        dailyPerformance.set(dateKey, dayData);
                    });

                    let maxProfit = -Infinity;
                    let minProfit = Infinity;

                    dailyPerformance.forEach((data, date) => {
                        const profitPerHour = data.hours > 0 ? data.earnings / data.hours : 0;
                        if (profitPerHour > maxProfit) {
                            maxProfit = profitPerHour;
                            // Adiciona um dia para corrigir o fuso horário que o new Date() pode introduzir
                            bestDay = { date: format(new Date(date.replace(/-/g, '/')), 'dd/MM/yyyy'), profitPerHour };
                        }
                        if (profitPerHour < minProfit && data.hours > 0) { // Garante que não pegue dias com 0 horas
                            minProfit = profitPerHour;
                            worstDay = { date: format(new Date(date.replace(/-/g, '/')), 'dd/MM/yyyy'), profitPerHour };
                        }
                    });

                    // If there's only one day, it can't be the worst day.
                    if (dailyPerformance.size <= 1) {
                        worstDay = null;
                    }
                }
                
                const bestApp = report.averageEarningPerHour.length > 0
                    ? report.averageEarningPerHour.reduce((max, current) => current.average > max.average ? current : max)
                    : null;

                setInsights({ bestDay, worstDay, bestApp });

            } catch (error) {
                console.error("Error fetching profitability insights:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInsights();
    }, [user]);

    if (isLoading) {
        return <AuditSkeleton />;
    }

    if (!insights || (!insights.bestDay && !insights.bestApp)) {
        return (
             <div className="text-center py-10 text-muted-foreground border-dashed border-2 rounded-lg">
                <BarChart3 className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">Dados Insuficientes</p>
                <p className="text-sm">Continue registrando seus ganhos para desbloquear esta análise.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {insights.bestDay && (
                <InsightCard 
                    icon={TrendingUp}
                    title="Seu Melhor Dia do Mês"
                    value={insights.bestDay.date}
                    subValue={`${formatCurrency(insights.bestDay.profitPerHour)} / hora`}
                    color="text-green-500"
                />
            )}
            {insights.worstDay && (
                 <InsightCard 
                    icon={TrendingDown}
                    title="Seu Pior Dia do Mês"
                    value={insights.worstDay.date}
                    subValue={`${formatCurrency(insights.worstDay.profitPerHour)} / hora`}
                    color="text-red-500"
                />
            )}
             {insights.bestApp && (
                <InsightCard 
                    icon={Award}
                    title="Plataforma Mais Rentável"
                    value={insights.bestApp.name}
                    subValue={`${formatCurrency(insights.bestApp.average)} / hora`}
                    color="text-primary"
                />
            )}
        </div>
    );
}
