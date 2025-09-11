
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getReportData, PeriodData, AverageEarningByCategory } from '@/services/summary.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, TrendingUp, TrendingDown, CheckCircle, BarChart3, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';
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
                // We'll analyze the current month's data
                const report = await getReportData(user!.id, { type: 'thisMonth' });
                
                let bestDay: Insight['bestDay'] = null;
                let worstDay: Insight['worstDay'] = null;

                if(report.profitEvolution.length > 0) {
                    const dailyPerformance = report.rawWorkDays.reduce((acc, day) => {
                        const dateKey = format(day.date, 'yyyy-MM-dd');
                        const dayData = acc.get(dateKey) || { earnings: 0, hours: 0 };
                        
                        dayData.earnings += day.earnings.reduce((sum, e) => sum + e.amount, 0);
                        dayData.hours += day.hours;
                        
                        acc.set(dateKey, dayData);
                        return acc;
                    }, new Map<string, { earnings: number; hours: number }>());

                    let maxProfit = -Infinity;
                    let minProfit = Infinity;

                    dailyPerformance.forEach((data, date) => {
                        const profitPerHour = data.hours > 0 ? data.earnings / data.hours : 0;
                        if (profitPerHour > maxProfit) {
                            maxProfit = profitPerHour;
                            bestDay = { date: format(new Date(date), 'dd/MM/yyyy'), profitPerHour };
                        }
                        if (profitPerHour < minProfit) {
                            minProfit = profitPerHour;
                            worstDay = { date: format(new Date(date), 'dd/MM/yyyy'), profitPerHour };
                        }
                    });
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
            {insights.worstDay && insights.worstDay.date !== insights.bestDay?.date && (
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
