
"use client";

import { useState } from 'react';
import { BotMessageSquare, Check, Copy, Crown, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

const premiumFeatures = [
  { text: 'Analisador de Corridas com IA: Descubra se uma corrida vale a pena antes de aceitar.', icon: BotMessageSquare },
  { text: 'Cards e gráficos ilimitados no Dashboard e Relatórios.', icon: Sparkles },
  { text: 'Personalize a ordem de todos os itens visuais.', icon: Sparkles },
  { text: 'Gerencie múltiplos veículos.', icon: Sparkles },
  { text: 'Categorias de ganhos e combustíveis totalmente personalizáveis.', icon: Sparkles },
  { text: 'Acesso a todas as futuras funcionalidades Premium.', icon: Sparkles },
  { text: 'Suporte prioritário.', icon: Sparkles },
];

// Substitua pelos seus dados reais antes de publicar
const YOUR_PIX_KEY = "seu-email-ou-chave-pix@dominio.com";
const YOUR_CONTACT_EMAIL = "seu-email-de-suporte@dominio.com";

export default function PremiumPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(YOUR_PIX_KEY);
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Chave PIX Copiada!</span>
        </div>
      ),
      description: 'Agora é só colar no app do seu banco para pagar.',
    });
  };

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

        <Button size="lg" className="text-lg font-bold animate-pulse" onClick={() => setIsModalOpen(true)}>
          <PartyPopper className="mr-2 h-6 w-6" />
          Quero ser Premium Agora!
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-center">Pagamento via PIX</DialogTitle>
            <DialogDescription className="text-center">
              Siga os passos abaixo para liberar seu acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center">
              <span className="font-semibold">Valor:</span> <span className="text-xl font-bold text-primary">R$ 59,90</span>
            </p>
            <div className="p-4 rounded-lg bg-secondary space-y-2">
                <Label htmlFor="pix-key">Chave PIX (E-mail)</Label>
                <div className="flex items-center gap-2">
                    <input id="pix-key" readOnly value={YOUR_PIX_KEY} className="flex-1 bg-muted p-2 rounded-md text-sm" />
                    <Button variant="outline" size="icon" onClick={handleCopyPixKey}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ul className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Copie a chave PIX acima.</li>
                <li>Abra o aplicativo do seu banco e faça o pagamento.</li>
                <li>Envie o comprovante para <strong className="text-primary">{YOUR_CONTACT_EMAIL}</strong></li>
                <li>Aguarde a confirmação. Seu acesso será liberado em breve!</li>
            </ul>
          </div>
           <DialogFooter>
             <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">Voltar ao Início</Button>
             </Link>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
