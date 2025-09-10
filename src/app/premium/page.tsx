
"use client";

import { useState } from 'react';
import { BotMessageSquare, Check, Crown, PartyPopper, Sparkles, Car, Camera, BarChart3, ShieldCheck, Accessibility, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

// Substitua pelos seus links de checkout
const PRO_CHECKOUT_LINK = "https://pay.hotmart.com/SEU_PRODUTO_PRO";
const AUTOPILOT_CHECKOUT_LINK = "https://pay.hotmart.com/SEU_PRODUTO_AUTOPILOT";

const features = [
  { id: 'registros', name: 'Registros Manuais Ilimitados', basic: true, pro: true, autopilot: true },
  { id: 'relatorios', name: 'Relatórios e Dashboard', basic: true, pro: true, autopilot: true },
  { id: 'taximetro', name: 'Taxímetro Inteligente', basic: '1 uso/semana', pro: 'Ilimitado', autopilot: 'Ilimitado' },
  { id: 'tx_ia', name: 'TX IA: Análise de Corridas', description: "Permite ao app ler as ofertas de corrida para análise", basic: false, pro: true, autopilot: true },
  { id: 'personalizacao', name: 'Personalização do Layout', basic: 'Limitado', pro: true, autopilot: true },
  { id: 'camera', name: 'Câmera de Segurança', basic: false, pro: 'Gravações de 5 min', autopilot: 'Gravações Ilimitadas' },
  { id: 'lembretes_manutencao', name: 'Lembretes de Manutenção', basic: false, pro: true, autopilot: true },
  { id: 'captura_auto', name: 'Captura Automática de Corridas', description: "Registra corridas finalizadas sem digitação", basic: false, pro: false, autopilot: true },
  { id: 'auditoria', name: 'Auditoria de Transparência', description: "Compara o KM da oferta com o KM real da viagem", basic: false, pro: false, autopilot: true },
  { id: 'afiliado', name: 'Programa de Parceiros', description: "Ganhe dinheiro indicando o app", basic: false, pro: true, autopilot: true },
];

const plans = [
    { 
        name: 'Básico', 
        description: 'O essencial para começar a organizar.',
        price: { monthly: 'Grátis', annual: 'Grátis' },
        link: ''
    },
    { 
        name: 'Pro', 
        description: 'Ferramentas de IA para decisões mais inteligentes.',
        price: { monthly: 'R$ 9,90', annual: 'R$ 99,90' },
        link: PRO_CHECKOUT_LINK
    },
    { 
        name: 'Autopilot', 
        description: 'A experiência completa com automação total.',
        price: { monthly: 'R$ 19,90', annual: 'R$ 199,90' },
        link: AUTOPILOT_CHECKOUT_LINK
    }
];

export default function PremiumPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div className="text-center space-y-4">
        <Crown className="mx-auto h-16 w-16 text-yellow-500" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Desbloqueie seu Potencial</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano que se encaixa na sua necessidade e transforme a gestão da sua vida de motorista.
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
                  {plan.name !== 'Básico' && (isAnnual ? 'por ano' : 'por mês')}
                </p>

                <ul className="space-y-4 pt-4">
                  {features.map(feature => {
                    const planKey = plan.name.toLowerCase() as 'basic' | 'pro' | 'autopilot';
                    const isIncluded = !!feature[planKey];
                    const featureText = feature[planKey] === true ? 'Incluído' : feature[planKey] || 'Não incluído';

                    return (
                       <li key={feature.id} className="flex items-start gap-3 text-sm">
                         <Check className={cn("h-5 w-5 mt-0.5 shrink-0", isIncluded ? 'text-green-500' : 'text-muted-foreground/30')} />
                         <div>
                            <span className={cn(!isIncluded && "text-muted-foreground/70")}>{feature.name}</span>
                            {feature.description && (
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                            )}
                            {typeof feature[planKey] !== 'boolean' && feature[planKey] && (
                                <p className="text-xs text-muted-foreground font-semibold">{feature[planKey]}</p>
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
      
      {/* Seção de Afiliados */}
       <Card className="mt-12 bg-secondary/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Handshake className="h-6 w-6 text-primary"/>
                    Seja um Parceiro Uber Cash
                </CardTitle>
                <CardDescription>
                    Transforme sua experiência em uma nova fonte de renda. Indique nosso app e ganhe dinheiro de verdade.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                   Nós acreditamos no poder da comunidade. Ao se tornar nosso parceiro, você recebe um link exclusivo para compartilhar. A cada novo motorista que assina um plano através da sua indicação, você ganha uma comissão. É simples: você ajuda seus colegas a serem mais lucrativos e é recompensado por isso.
                </p>
                <Link href="/suporte?assunto=afiliado" passHref>
                    <Button variant="outline">Quero ser um Parceiro</Button>
                </Link>
            </CardContent>
        </Card>
    </div>
  );
}
