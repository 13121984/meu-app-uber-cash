
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Clock, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react';
import { getTodayData, PeriodData } from '@/services/summary.service';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ResultCard = ({ label, value, icon: Icon }: { label: string, value: string, icon: React.ElementType }) => (
    <Card className="text-center p-4 bg-secondary">
        <dt className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Icon className="w-4 h-4"/>
            {label}
        </dt>
        <dd className="text-2xl font-bold text-primary">{value}</dd>
    </Card>
);

export function FinancialGoalCalculator() {
    const [todayData, setTodayData] = useState<PeriodData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [goalAmount, setGoalAmount] = useState(500);
    const [hourlyRate, setHourlyRate] = useState(30);
    const [hoursPerDay, setHoursPerDay] = useState(8);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getTodayData();
                setTodayData(data);
                // Se o usuário tiver um ganho/hora registrado, usa esse valor.
                if (data && data.ganhoPorHora > 0) {
                    setHourlyRate(data.ganhoPorHora);
                }
            } catch (error) {
                console.error("Failed to load today's data for calculator", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const { totalHoursNeeded, totalDaysNeeded } = useMemo(() => {
        if (goalAmount <= 0 || hourlyRate <= 0) {
            return { totalHoursNeeded: 0, totalDaysNeeded: 0 };
        }
        const hours = goalAmount / hourlyRate;
        const days = hoursPerDay > 0 ? hours / hoursPerDay : 0;
        return { totalHoursNeeded: hours, totalDaysNeeded: days };
    }, [goalAmount, hourlyRate, hoursPerDay]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <div className="space-y-6">
            <Alert variant="default" className="bg-secondary">
                 <TrendingUp className="h-4 w-4" />
                 <AlertDescription>
                    {todayData && todayData.ganhoPorHora > 0 
                        ? `Seu ganho bruto por hora hoje é de ${formatCurrency(todayData.ganhoPorHora)}. Usamos esse valor para o cálculo, mas você pode ajustá-lo.`
                        : "Não encontramos um ganho/hora hoje. Usamos um valor padrão que você pode ajustar."
                    }
                 </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="goalAmount">Qual o seu objetivo (R$)?</Label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        <Input id="goalAmount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} className="pl-10"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Seu ganho médio por hora (R$)</Label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <Input id="hourlyRate" type="number" value={hourlyRate.toFixed(2)} onChange={(e) => setHourlyRate(Number(e.target.value))} className="pl-10"/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="hoursPerDay">Horas de trabalho por dia</Label>
                     <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                        <Input id="hoursPerDay" type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))} className="pl-10" />
                    </div>
                </div>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <ResultCard label="Total de horas necessárias" value={`${totalHoursNeeded.toFixed(1)}h`} icon={Clock} />
                <ResultCard label="Total de dias necessários" value={`${totalDaysNeeded.toFixed(1)} dias`} icon={CalendarDays} />
            </dl>
        </div>
    );
}
