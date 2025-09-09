
"use client";

import { useState } from 'react';
import { BotMessageSquare, Check, Crown, PartyPopper, Sparkles, Car, Camera, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

// Substitua pelos seus links de checkout
const PRO_CHECKOUT_LINK = "https://pay.hotmart.com/SEU_PRODUTO_PRO";
const AUTOPILOT_CHECKOUT_LINK = "https://pay.hotmart.com/SEU_PRODUTO_AUTOPILOT";

const features = [
  { id: 'registros', name: 'Registros Manuais', basic: true, pro: true, autopilot: true },
  { id: 'relatorios', name: 'Relatórios Básicos', basic: true, pro: true, autopilot: true },
  { id: 'taximetro', name: 'Taxímetro Inteligente', basic: '1 uso/semana', pro: 'Ilimitado', autopilot: 'Ilimitado' },
  { id: 'tx_ia', name: 'TX IA: Analisador de Corridas', basic: false, pro: true, autopilot: true },
  { id: 'camera', name: 'Câmera de Segurança', basic: false, pro: '5 min/viagem', autopilot: 'Ilimitado' },
  { id: 'personalizacao', name: 'Personalização de Layout', basic: false, pro: true, autopilot: true },
  { id: 'captura_auto', name: 'Captura Automática de Corridas', basic: false, pro: false, autopilot: true },
  { id: 'auditoria', name: 'Auditoria de Transparência', basic: false, pro: false, autopilot: true },
];

const PlanCard = ({ plan, isAnnual, onSelect, isSelected }: { plan: any, isAnnual: boolean, onSelect: () => void, isSelected: boolean }) => (
  <Card className={cn("flex flex-col", isSelected ? "border-primary ring-2 ring-primary" : "")}>
    <CardHeader className="text-center">
      <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
      <CardDescription>{plan.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-1 space-y-2">
      <p className="text-4xl font-bold text-center">
        {isAnnual ? plan.price.annual : plan.price.monthly}
      </p>
      <p className="text-xs text-muted-foreground text-center">
        {isAnnual ? 'por ano' : 'por mês'}
      </p>
      <ul className="space-y-3 pt-4">
        {features.map(feature => (
          <li key={feature.id} className="flex items-center gap-2 text-sm">
            <Check className={cn("h-4 w-4", plan.features.includes(feature.id) || plan.name === 'Básico' ? 'text-green-500' : 'text-muted-foreground/30')} />
            <span className={cn(plan.features.includes(feature.id) || plan.name === 'Básico' ? '' : 'text-muted-foreground/50')}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
    <div className="p-6 pt-0">
      <Button onClick={onSelect} className="w-full" variant={isSelected ? 'default' : 'outline'}>
        {plan.name === 'Básico' ? 'Seu Plano Atual' : 'Selecionar'}
      </Button>
    </div>
  </Card>
);

const plans = [
    { 
        name: 'Básico', 
        description: 'O essencial para começar a organizar.',
        price: { monthly: 'Grátis', annual: 'Grátis' },
        features: ['registros', 'relatorios', 'taximetro'],
        link: ''
    },
    { 
        name: 'Pro', 
        description: 'Ferramentas de IA para decisões mais inteligentes.',
        price: { monthly: 'R$ 9,90', annual: 'R$ 99,90' },
        features: ['registros', 'relatorios', 'taximetro', 'tx_ia', 'camera', 'personalizacao'],
        link: PRO_CHECKOUT_LINK
    },
    { 
        name: 'Autopilot', 
        description: 'A experiência completa com automação total.',
        price: { monthly: 'R$ 19,90', annual: 'R$ 199,90' },
        features: ['registros', 'relatorios', 'taximetro', 'tx_ia', 'camera', 'personalizacao', 'captura_auto', 'auditoria'],
        link: AUTOPILOT_CHECKOUT_LINK
    }
];

export default function PremiumPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div className="text-center space-y-4">
        <Crown className="mx-auto h-16 w-16 text-yellow-500" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Planos e Preços</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano que se encaixa na sua necessidade e eleve seu controle financeiro.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
          <span>Mensal</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} aria-label="Alterar para cobrança anual ou mensal"/>
          <span className="font-bold text-primary">Anual (Economize 2 meses)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map(plan => (
           <Card key={plan.name} className={cn(
             "flex flex-col transition-all duration-300",
             plan.name === 'Pro' && "border-primary ring-2 ring-primary shadow-lg"
           )}>
              <CardHeader className="text-center">
                {plan.name === 'Pro' && <div className="text-sm font-bold text-primary -mt-2 mb-2">MAIS POPULAR</div>}
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <p className="text-4xl font-bold text-center">
                  {isAnnual ? plan.price.annual : plan.price.monthly}
                </p>
                <p className="text-xs text-muted-foreground text-center mb-6">
                  {plan.name !== 'Grátis' && (isAnnual ? 'por ano' : 'por mês')}
                </p>

                <ul className="space-y-4 pt-4">
                  {features.map(feature => {
                    const planFeature = (plan.features as any)[feature.id];
                    let featureText = '';
                     if (typeof plan.features[feature.id as keyof typeof plan.features] === 'string') {
                      featureText = plan.features[feature.id as keyof typeof plan.features];
                    } else if (plan.features.includes(feature.id)) {
                      featureText = "Incluído"
                    }

                    return (
                       <li key={feature.id} className="flex items-start gap-3 text-sm">
                         <Check className={cn("h-5 w-5 mt-0.5 shrink-0", featureText ? 'text-green-500' : 'text-muted-foreground/30')} />
                         <div>
                            <span>{feature.name}</span>
                            {typeof feature[plan.name.toLowerCase() as keyof typeof feature] === 'string' && (
                                <p className="text-xs text-muted-foreground">{feature[plan.name.toLowerCase() as keyof typeof feature]}</p>
                            )}
                         </div>
                       </li>
                    )
                  })}
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-6">
                <Link href={plan.link} passHref legacyBehavior>
                    <Button 
                        className="w-full" 
                        variant={plan.name === 'Pro' ? 'default' : 'outline'}
                        disabled={plan.name === 'Básico'}
                    >
                      {plan.name === 'Básico' ? 'Seu Plano Atual' : 'Fazer Upgrade'}
                    </Button>
                </Link>
              </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
