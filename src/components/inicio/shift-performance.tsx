
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Sunrise, Sunset, Trophy, Clock } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface PerformanceByShift {
    shift: 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite';
    profit: number;
    hours: number;
    profitPerHour: number;
}

const shiftIcons = {
    Madrugada: <Moon className="h-6 w-6 text-indigo-400" />,
    Manhã: <Sunrise className="h-6 w-6 text-orange-400" />,
    Tarde: <Sun className="h-6 w-6 text-yellow-400" />,
    Noite: <Sunset className="h-6 w-6 text-purple-400" />,
};

interface ShiftPerformanceProps {
    performance?: PerformanceByShift[];
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ShiftPerformance({ performance }: ShiftPerformanceProps) {
    const bestShift = useMemo(() => {
        if (!performance || performance.length === 0) return null;
        return performance.reduce((best, current) => current.profitPerHour > best.profitPerHour ? current : best);
    }, [performance]);

    if (!performance || performance.length === 0) {
        return null; // Não renderiza nada se não houver dados
    }

    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Análise por Turno</CardTitle>
                <CardDescription>Veja qual período do dia foi mais lucrativo para você hoje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bestShift && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                        <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="font-bold text-green-600 dark:text-green-400">Seu turno mais lucrativo foi a {bestShift.shift.toLowerCase()}!</p>
                        <p className="text-sm text-muted-foreground">
                            Com uma média de <span className="font-semibold">{formatCurrency(bestShift.profitPerHour)}</span> por hora.
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {performance.map((p) => (
                        <div key={p.shift} className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border bg-card",
                            p.shift === bestShift?.shift && "border-green-500/50 ring-2 ring-green-500/20"
                        )}>
                            <div className="p-3 rounded-full bg-primary/10">
                                {shiftIcons[p.shift]}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-base">{p.shift}</p>
                                <p className="text-sm text-green-500 font-semibold">{formatCurrency(p.profit)}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                   <span>
                                     {p.hours.toFixed(1)}h
                                   </span>
                                   <span className="font-mono">
                                     {formatCurrency(p.profitPerHour)}/h
                                   </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
