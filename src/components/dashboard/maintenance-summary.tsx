
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import Link from 'next/link';

interface MaintenanceSummaryProps {
  data: {
    totalSpent: number;
    servicesPerformed: number;
  };
}

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-secondary/50 flex-1 min-w-[100px]">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);


export function MaintenanceSummary({ data }: MaintenanceSummaryProps) {
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const averageCost = data.servicesPerformed > 0 ? data.totalSpent / data.servicesPerformed : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Wrench className="w-6 h-6 text-primary" />
                Resumo de Manutenção
            </CardTitle>
            <CardDescription>
                Acompanhe seus gastos com manutenção no período.
            </CardDescription>
        </div>
        <Link href="/manutencao" passHref>
          <Button variant="outline" size="sm">
              Ver Detalhes
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <StatItem label="Total Gasto" value={formatCurrency(data.totalSpent)} />
        <StatItem label="Serviços" value={data.servicesPerformed} />
        <StatItem label="Média/Serviço" value={formatCurrency(averageCost)} />
      </CardContent>
    </Card>
  );
}
