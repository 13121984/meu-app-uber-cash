
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ShieldCheck } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

// Placeholder data - in the future this would come from a service
const callHistoryItem = {
    imageUrl: "/images/call-history-placeholder.png", 
    altText: "Exemplo de uma corrida capturada da Uber"
};

export default function HistoricoChamadasPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="mx-auto w-16 h-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline">
          Captura Automática de Corridas
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
          Deixe o trabalho manual para trás. Nossa próxima grande funcionalidade permitirá que o Uber Cash registre seus ganhos da Uber e 99 automaticamente, com sua permissão.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Como vai funcionar?</CardTitle>
            <CardDescription>
                Usando os Serviços de Acessibilidade do Android, o app poderá ler os dados da tela de resumo da corrida e salvá-los para você, de forma segura e privada.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
            <div className="text-center text-muted-foreground py-10 bg-secondary rounded-lg">
                <p className="font-semibold mb-4">Exemplo de como uma chamada capturada será exibida:</p>
                <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden border-4 border-card shadow-lg">
                   <Image
                        src="https://storage.googleapis.com/static.aiforge.co/templates/uber-cash/call-history-placeholder.png"
                        alt={callHistoryItem.altText}
                        width={400}
                        height={711}
                        className="object-contain"
                    />
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
                <p className="text-green-800 dark:text-green-300">
                    Esta funcionalidade será **opcional** e só funcionará com a **sua permissão explícita**. Seus dados de corrida nunca sairão do seu aparelho. O Uber Cash não terá acesso às suas senhas ou qualquer outra informação pessoal.
                </p>
            </CardContent>
       </Card>
        <div className="text-center">
            <Link href="/gerenciamento" passHref>
                <Button>Voltar para o Gerenciamento</Button>
            </Link>
        </div>
    </div>
  );
}
