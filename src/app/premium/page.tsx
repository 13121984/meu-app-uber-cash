
"use client";

import { useState } from 'react';
import { BotMessageSquare, Check, Crown, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const premiumFeatures = [
  { text: 'Analisador de Corridas com IA: Descubra se uma corrida vale a pena antes de aceitar.', icon: BotMessageSquare },
  { text: 'Cards e gráficos ilimitados no Dashboard e Relatórios.', icon: Sparkles },
  { text: 'Personalize a ordem de todos os itens visuais.', icon: Sparkles },
  { text: 'Gerencie múltiplos veículos.', icon: Sparkles },
  { text: 'Categorias de ganhos e combustíveis totalmente personalizáveis.', icon: Sparkles },
  { text: 'Acesso a todas as futuras funcionalidades Premium.', icon: Sparkles },
  { text: 'Suporte prioritário.', icon: Sparkles },
];

// Substitua pelo seu link de checkout da Hotmart ou outra plataforma
const YOUR_CHECKOUT_LINK = "https://pay.hotmart.com/SEU_PRODUTO";


export default function PremiumPage() {

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 space-y-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="text-center space-y-4">
          <Crown className="mx-auto h-16 w-16 text-yellow-500" />
          <h1 className="text-5xl font-bold font-headline text-foreground">Seja um Assinante Premium</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Desbloqueie todo o potencial do Uber Cash e leve seu controle financeiro para o próximo nível.
          </p>
        </div>

        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-center">Vantagens Exclusivas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="p-1 bg-green-500/20 rounded-full mt-1">
                    <feature.icon className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="flex-1">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-secondary border-primary/50">
           <CardHeader className="text-center">
             <CardTitle className="font-headline text-3xl">Plano Anual</CardTitle>
             <CardDescription>Acesso completo por um ano.</CardDescription>
           </CardHeader>
           <CardContent className="text-center">
                <p className="text-5xl font-bold">R$ 59,90</p>
                <p className="text-muted-foreground">Pagamento único</p>
           </CardContent>
        </Card>

        <Link href={YOUR_CHECKOUT_LINK} passHref legacyBehavior>
            <Button size="lg" className="text-lg font-bold animate-pulse" as="a" target="_blank">
                <PartyPopper className="mr-2 h-6 w-6" />
                Quero ser Premium Agora!
            </Button>
        </Link>
      </div>
    </>
  );
}
