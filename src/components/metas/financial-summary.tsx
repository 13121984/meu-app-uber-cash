
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const StatCard = ({ title, value, icon: Icon, description, variant }: { title: string, value: string, icon: React.ElementType, description: string, variant: 'income' | 'expense' | 'net' }) => {
    const variantClasses = {
        income: { bg: "bg-green-500" },
        expense: { bg: "bg-red-500" },
        net: { bg: "bg-primary" },
    };

    return (
        <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-full", variantClasses[variant].bg)}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className={cn("text-2xl font-bold")}>{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};

interface FinancialSummaryProps {
    monthlyProfit: number;
    personalExpenses: number;
}

export function FinancialSummary({ monthlyProfit, personalExpenses }: FinancialSummaryProps) {
    const netResult = monthlyProfit - personalExpenses;
    
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
