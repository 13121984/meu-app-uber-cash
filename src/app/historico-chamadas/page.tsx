
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ShieldCheck, Clock, Accessibility } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export default function HistoricoChamadasPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="mx-auto w-16 h-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline">
          Análise Automática de Corridas
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
          Deixe o trabalho manual para trás. Nossa próxima grande funcionalidade analisará as ofertas de corrida em tempo real, assim que elas aparecerem na sua tela.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>A Solução para a Decisão de Poucos Segundos</CardTitle>
            <CardDescription>
                Sabemos que você tem poucos segundos para aceitar uma corrida. A análise automática resolve isso.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-primary"/> Como vai funcionar?</h3>
                    <p className="text-sm text-muted-foreground">
                        Através dos **Serviços de Acessibilidade do Android**, o aplicativo poderá ler os dados da tela (valor, distância, tempo) da oferta de corrida assim que ela surgir. Em seguida, uma pequena notificação aparecerá com o veredito "Bora" ou "Tô Fora", ajudando você a decidir rapidamente.
                    </p>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Accessibility className="w-5 h-5 text-primary"/> O que são os Serviços de Acessibilidade?</h3>
                    <p className="text-sm text-muted-foreground">
                       É uma ferramenta do Android criada para ajudar usuários, permitindo que apps autorizados leiam o conteúdo da tela. Nosso app usará essa tecnologia de forma focada para identificar e extrair apenas os dados de ofertas de corrida dos aplicativos de transporte.
                    </p>
                </div>
            </div>

            <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden border-4 border-card shadow-lg">
                <Image
                    src="https://storage.googleapis.com/static.aiforge.co/templates/uber-cash/race-analysis-overlay-placeholder.png"
                    alt="Exemplo de análise automática de corrida sobreposta na tela do aplicativo de transporte"
                    width={400}
                    height={711}
                    className="object-contain"
                />
                 <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-md text-center">
                    <p className="text-xs text-muted-foreground">Exemplo de como a análise aparecerá na tela.</p>
                </div>
            </div>
        </CardContent>
      </Card>
       <Card className="border-green-500/50 bg-green-500/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                    Sua Privacidade em Primeiro Lugar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-green-800 dark:text-green-300">
                  <li>Esta funcionalidade será **100% opcional** e só funcionará com a **sua permissão explícita**.</li>
                  <li>O aplicativo **não salvará imagens** da sua tela.</li>
                  <li>Não teremos acesso a senhas, mensagens ou qualquer outra informação pessoal. Apenas os dados da oferta de corrida serão lidos momentaneamente para a análise.</li>
                </ul>
            </CardContent>
       </Card>
        <div className="text-center">
            <Link href="/analisador" passHref>
                <Button>Voltar para o Analisador Manual</Button>
            </Link>
        </div>
    </div>
  );
}
