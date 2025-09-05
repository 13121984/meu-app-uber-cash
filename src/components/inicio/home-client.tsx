
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart, Wrench, Target, Settings, History } from "lucide-react";
import Link from "next/link";

const mainActions = [
  { href: "/registrar/today", label: "Registrar Dia Atual", icon: PlusCircle },
  { href: "/registrar/other-day", label: "Registrar Outro Dia", icon: History },
  { href: "/dashboard", label: "Acompanhar Performance", icon: BarChart, variant: "secondary" },
];

const secondaryActions = [
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/metas", label: "Planejamento", icon: Target },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];


export function HomeClient() {
  return (
    <div className="space-y-8">
      <div className="text-center w-full">
        <h1 className="text-4xl font-bold font-headline">Bem-vindo ao Uber Cash!</h1>
        <p className="text-muted-foreground">Seu assistente para maximizar seus ganhos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainActions.map((action) => (
          <Link key={action.href} href={action.href} passHref>
            <Button
              variant={action.variant as any || "default"}
              className="w-full h-24 text-lg justify-start p-6 gap-4"
            >
              <action.icon className="h-8 w-8" />
              <span>{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {secondaryActions.map((action) => (
             <Link key={action.href} href={action.href} passHref>
                <Button
                    variant="outline"
                    className="w-full h-16 justify-start p-4 gap-3"
                >
                    <action.icon className="h-6 w-6 text-primary" />
                    <span>{action.label}</span>
                </Button>
             </Link>
        ))}
      </div>
    </div>
  );
}
