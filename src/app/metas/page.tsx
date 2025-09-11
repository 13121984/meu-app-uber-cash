
"use client";

import { GoalPlanner } from '@/components/metas/goal-planner';
import { FinancialGoalCalculator } from '@/components/metas/financial-goal-calculator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Target, Calculator, Wallet, Loader2, Gem, BarChart3 } from 'lucide-react';
import { PersonalExpenseTracker } from '@/components/metas/personal-expense-tracker';
import { FinancialSummary } from '@/components/metas/financial-summary';
import { ProfitabilityAudit } from '@/components/metas/profitability-audit';
import { useAuth } from '@/contexts/auth-context';

export default function MetasPage() {
    const { loading, isPro } = useAuth();
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planejamento Financeiro</h1>
        <p className="text-muted-foreground">Defina suas metas, controle suas despesas e veja o resultado em tempo real.</p>
      </div>

      {/* Resumo do Mês no topo, sempre visível */}
      <FinancialSummary />

      {/* Ferramentas abaixo, dentro de acordeões */}
      <div className="space-y-4">
          <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-4">
            <Card>
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="p-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-primary" />
                            <div>
                                <h2 className="font-semibold text-lg text-left">Plano de Metas Mensal</h2>
                                <p className="text-sm text-muted-foreground text-left font-normal">Defina sua meta de lucro recorrente.</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                        <GoalPlanner />
                    </AccordionContent>
                </AccordionItem>
            </Card>
            
            {isPro && (
                <Card>
                    <AccordionItem value="item-4" className="border-b-0">
                        <AccordionTrigger className="p-6">
                             <div className="flex items-center gap-3">
                                <Gem className="w-6 h-6 text-primary" />
                                <div>
                                    <h2 className="font-semibold text-lg text-left">Auditoria de Rentabilidade</h2>
                                    <p className="text-sm text-muted-foreground text-left font-normal">Descubra seus dias e apps mais lucrativos.</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <ProfitabilityAudit />
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            )}

            <Card>
                <AccordionItem value="item-2" className="border-b-0">
                    <AccordionTrigger className="p-6">
                        <div className="flex items-center gap-3">
                            <Calculator className="w-6 h-6 text-primary" />
                            <div>
                                <h2 className="font-semibold text-lg text-left">Calculadora de Objetivos</h2>
                                <p className="text-sm text-muted-foreground text-left font-normal">Estime o tempo para alcançar um valor específico.</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                    <FinancialGoalCalculator />
                    </AccordionContent>
                </AccordionItem>
            </Card>

            <Card>
                <AccordionItem value="item-3" className="border-b-0">
                    <AccordionTrigger className="p-6">
                        <div className="flex items-center gap-3">
                            <Wallet className="w-6 h-6 text-primary" />
                            <div>
                                <h2 className="font-semibold text-lg text-left">Controle de Despesas Pessoais</h2>
                                <p className="text-sm text-muted-foreground text-left font-normal">Registre seus gastos do dia a dia.</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                    <PersonalExpenseTracker />
                    </AccordionContent>
                </AccordionItem>
            </Card>
          </Accordion>
      </div>

    </div>
  );
}
