
"use client";

import { useAuth } from '@/contexts/auth-context';
import { BotMessageSquare, Loader2, Sparkles, Gem, ArrowRight, Lock, DollarSign, Target, ThumbsUp } from 'lucide-react';
import { AnalyzerClient } from '@/components/analisador/analyzer-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

function PremiumUpgradeScreen() {
    return (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-6">
             <div className="relative w-48 h-48">
                 <BotMessageSquare className="absolute w-24 h-24 text-muted-foreground/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 <Gem className="absolute w-16 h-16 text-yellow-500 bottom-0 right-0 animate-pulse" />
             </div>
            <h1 className="text-3xl font-bold font-headline text-primary">Decida em Segundos com o TX IA</h1>
            <p className="text-lg text-foreground max-w-lg">
                O TX IA é seu copiloto inteligente. Ele lê o print da sua corrida, analisa com base nas suas metas e te diz se vale a pena. <strong className="text-primary">Chega de aceitar corridas no prejuízo!</strong>
            </p>
            <Card className="bg-secondary/50 w-full max-w-md">
                 <CardContent className="p-6">
                     <ul className="text-left space-y-3">
                         <li className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-primary" /> Análise instantânea de valor, distância e tempo.</li>
                         <li className="flex items-center gap-3"><ThumbsUp className="h-5 w-5 text-primary" /> Recomendação "Bora" ou "Tô Fora".</li>
                         <li className="flex items-center gap-3"><Target className="h-5 w-5 text-primary" /> Use suas próprias metas de R$/km e R$/hora.</li>
                     </ul>
                 </CardContent>
            </Card>
            <Link href="/premium" passHref>
                <Button size="lg" className="animate-pulse">
                    <Lock className="mr-2 h-4 w-4" />
                    Desbloquear com Pro ou Autopilot
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    )
}


export default function AnalisadorPage() {
  const { isPro, loading } = useAuth();
  
  if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  if (!isPro) {
      return <PremiumUpgradeScreen />
  }
  
  return (
    <div className="space-y-6">
       <div className="text-center">
        <h1 className="text-5xl font-bold font-headline flex items-center justify-center gap-3">
            <BotMessageSquare className="w-12 h-12 text-primary" />
            TX IA
        </h1>
        <p className="text-xl text-muted-foreground">O Analisador de Corridas com Inteligência Artificial.</p>
      </div>
      
      <AnalyzerClient />
    </div>
  );
}
