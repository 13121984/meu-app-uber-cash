
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Wallet, Equal } from 'lucide-react';
import { getSummaryForPeriod } from '@/services/summary.service';
import { getCurrentMonthPersonalExpensesTotal } from '@/services/personal-expense.service';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';


const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const StatCard = ({ title, value, icon: Icon, description, variant }: { title: string, value: string, icon: React.ElementType, description: string, variant: 'income' | 'expense' | 'net' }) => {
    const variantClasses = {
        income: {
            bg: "bg-green-500",
            text: "text-green-500"
        },
        expense: {
            bg: "bg-red-500",
            text: "text-red-500"
        },
        net: {
            bg: "bg-primary",
            text: "text-primary"
        }
    }

    return (
        <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-full", variantClasses[variant].bg)}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className={cn("text-2xl font-bold")}>{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    )
};


export function FinancialSummary() {
    const { user } = useAuth();
    const [monthlyProfit, setMonthlyProfit] = useState(0);
    const [personalExpenses, setPersonalExpenses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [summary, expenses] = await Promise.all([
                    getSummaryForPeriod(user.id),
                    getCurrentMonthPersonalExpensesTotal(user.id)
                ]);
                setMonthlyProfit(summary.mes.totalLucro);
                setPersonalExpenses(expenses);
            } catch (error) {
                console.error("Failed to load financial summary data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const netResult = monthlyProfit - personalExpenses;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4 items-center">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                     <div className="flex gap-4 items-center">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                    <hr/>
                    <div className="flex gap-4 items-center">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-xl">Resumo Financeiro do Mês</CardTitle>
                <CardDescription>O balanço das suas finanças pessoais e de trabalho.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <StatCard 
                    title="Lucro do Trabalho"
                    description="O que sobrou das corridas"
                    value={formatCurrency(monthlyProfit)}
                    icon={TrendingUp}
                    variant="income"
                />

                <StatCard 
                    title="Despesas Pessoais"
                    description="Gastos fora do trabalho"
                    value={formatCurrency(personalExpenses)}
                    icon={TrendingDown}
                    variant="expense"
                />

                 <div className="relative flex justify-center">
                    <hr className="w-full border-dashed" />
                    <span className="absolute -top-3 px-2 bg-card text-muted-foreground"><Equal size={16} /></span>
                </div>

                 <StatCard 
                    title="Saldo Final do Mês"
                    description="O que realmente sobrou para você"
                    value={formatCurrency(netResult)}
                    icon={Wallet}
                    variant="net"
                />
            </CardContent>
        </Card>
    );
}
