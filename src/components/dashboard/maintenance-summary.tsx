
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
    <div className="flex flex-col items-center text-center">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);


export function MaintenanceSummary({ data }: MaintenanceSummaryProps) {
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const averageCost = data.servicesPerformed > 0 ? data.totalSpent / data.servicesPerformed : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Wrench className="w-6 h-6 text-primary" />
                Resumo de Manutenção (Mês)
            </CardTitle>
            <CardDescription>
                Acompanhe seus gastos com manutenção neste mês.
            </CardDescription>
        </div>
        <Link href="/manutencao" passHref>
          <Button variant="outline">
              Ver Detalhes
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
        <StatItem label="Total Gasto" value={formatCurrency(data.totalSpent)} />
        <StatItem label="Serviços Realizados" value={data.servicesPerformed} />
        <StatItem label="Média por Serviço" value={formatCurrency(averageCost)} />
      </CardContent>
    </Card>
  );
}
