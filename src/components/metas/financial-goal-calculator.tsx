
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Clock, CalendarDays, TrendingUp } from 'lucide-react';
import { getReportData, PeriodData } from '@/services/summary.service';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '@/contexts/auth-context';


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ResultCard = ({ label, value, icon: Icon, iconColor }: { label: string, value: string, icon: React.ElementType, iconColor?: string }) => (
    <Card className="text-center p-4 bg-secondary">
        <dt className="text-sm text-foreground font-bold flex items-center justify-center gap-2">
            <Icon className={`w-4 h-4 ${iconColor}`}/>
            <span className="text-foreground font-bold">{label}</span>
        </dt>
        <dd className="text-2xl font-bold text-foreground">{value}</dd>
    </Card>
);

const timeToMinutes = (time: string): number => {
    if(!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
};

const minutesToDecimal = (minutes: number): number => {
    return minutes / 60;
};


export function FinancialGoalCalculator() {
    const { user } = useAuth();
    const [reportData, setReportData] = useState<PeriodData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [goalAmount, setGoalAmount] = useState<number | ''>('');
    const [hourlyRate, setHourlyRate] = useState<number | ''>(30);
    const [hoursPerDayInput, setHoursPerDayInput] = useState('08:00'); // HH:MM format

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        const loadData = async () => {
            try {
                // Using last 7 days for a more stable average
                const data = await getReportData(user.id, { type: 'thisWeek' });
                setReportData(data);
                if (data && data.ganhoPorHora > 0) {
                    setHourlyRate(parseFloat(data.ganhoPorHora.toFixed(2)));
                }
            } catch (error) {
                console.error("Failed to load today's data for calculator", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);
    
    const hoursPerDayDecimal = useMemo(() => {
        return minutesToDecimal(timeToMinutes(hoursPerDayInput));
    }, [hoursPerDayInput]);

    const { totalHoursNeeded, totalDaysNeeded } = useMemo(() => {
        const numericGoal = Number(goalAmount);
        const numericRate = Number(hourlyRate);

        if (numericGoal <= 0 || numericRate <= 0) {
            return { totalHoursNeeded: 0, totalDaysNeeded: 0 };
        }
        const hours = numericGoal / numericRate;
        const days = hoursPerDayDecimal > 0 ? hours / hoursPerDayDecimal : 0;
        return { totalHoursNeeded: hours, totalDaysNeeded: days };
    }, [goalAmount, hourlyRate, hoursPerDayDecimal]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <div className="space-y-6">
            <Alert variant="default" className="bg-secondary">
                 <TrendingUp className="h-4 w-4 text-green-500" />
                 <AlertDescription>
                    {reportData && reportData.ganhoPorHora > 0 
                        ? `Seu ganho bruto por hora (últimos 7 dias) é de ${formatCurrency(reportData.ganhoPorHora)}. Usamos esse valor para o cálculo, mas você pode ajustá-lo.`
                        : "Não encontramos um ganho/hora recente. Usamos um valor padrão que você pode ajustar."
                    }
                 </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="goalAmount" className="font-bold text-foreground">Qual o seu objetivo (R$)?</Label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                        <Input id="goalAmount" type="number" placeholder="Ex: 500" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value === '' ? '' : Number(e.target.value))} className="pl-10"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="font-bold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/>Seu ganho médio por hora (R$)</Label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <Input id="hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} className="pl-10"/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="hoursPerDay" className="font-bold text-foreground">Horas de trabalho por dia</Label>
                     <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                        <Input id="hoursPerDay" type="time" value={hoursPerDayInput} onChange={(e) => setHoursPerDayInput(e.target.value)} className="pl-10" />
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">O valor será convertido para horas decimais (Ex: 8:30 = 8.5h).</p>
                 </div>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <ResultCard label="Total de horas necessárias" value={`${totalHoursNeeded.toFixed(1)}h`} icon={Clock} iconColor="text-orange-500" />
                <ResultCard label="Total de dias necessários" value={`${totalDaysNeeded.toFixed(1)} dias`} icon={CalendarDays} iconColor="text-blue-500" />
            </dl>
        </div>
    );
}
