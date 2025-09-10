
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ShieldCheck, Clock, Accessibility, ThumbsUp, MapPin, Star, Route, X, Sparkles } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

function RideOfferSimulation() {
    return (
        <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden border-8 border-slate-800 bg-slate-200 shadow-xl">
            {/* Fundo de Mapa Falso */}
            <Image
                src="https://picsum.photos/400/800?grayscale"
                alt="Fundo de mapa da cidade"
                layout="fill"
                objectFit="cover"
                className="opacity-50"
                data-ai-hint="city map"
            />
            
            {/* Card de Oferta de Corrida */}
            <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-4 text-slate-800 dark:text-slate-200">
                <div className="flex justify-between items-center">
                    <p className="font-bold">UberX</p>
                    <X className="h-4 w-4 text-slate-500"/>
                </div>
                <h3 className="text-4xl font-bold my-2">R$ 22,28</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Star className="h-4 w-4 text-yellow-500 fill-current"/>
                    <span>4,94</span>
                    <span>+R$ 4,00 incluído</span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-1 text-primary"/>
                        <div>
                            <p><strong>15 min</strong> (5.2 km) de distância</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Rua Fernandes Vieira, Cantagalo</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Route className="h-4 w-4 mt-1 text-primary"/>
                        <div>
                             <p><strong>17 min</strong> (8.4 km) de viagem</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">R. Dos Expedicionarios, 144 - Bingen</p>
                        </div>
                    </div>
                </div>
                 <Button className="w-full mt-4 bg-slate-800 dark:bg-slate-200 text-white dark:text-black hover:bg-slate-700">Selecionar</Button>
            </div>

            {/* Overlay de Análise do Uber Cash */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5">
                <Card className="bg-background/80 dark:bg-card/80 backdrop-blur-md border-2 border-primary shadow-2xl animate-fade-in">
                    <CardHeader className="p-3 text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-primary font-headline text-2xl">
                            <Sparkles className="h-6 w-6"/>
                            Análise Uber Cash
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                         <div className="flex justify-center items-center gap-3 p-3 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 mb-3">
                             <ThumbsUp className="h-8 w-8" />
                             <p className="text-3xl font-bold">Bora!</p>
                         </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-secondary p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">Ganho/KM</p>
                                <p className="font-bold text-green-600 dark:text-green-400">R$ 2,65</p>
                            </div>
                            <div className="bg-secondary p-2 rounded-md">
                                <p className="text-xs text-muted-foreground">Ganho/Hora</p>
                                <p className="font-bold text-green-600 dark:text-green-400">R$ 78,63</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function HistoricoChamadasPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="mx-auto w-16 h-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline">
          Registro Simplificado de Corridas
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
          Deixe o trabalho manual para trás. Nossa próxima grande funcionalidade irá registrar seus ganhos com um toque, lendo os dados da notificação de corrida finalizada.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>A Solução para a Agilidade do Dia a Dia</CardTitle>
            <CardDescription>
                Sabemos que você não tem tempo a perder. O registro simplificado resolve isso.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-primary"/> Como vai funcionar?</h3>
                    <p className="text-sm text-muted-foreground">
                        Através dos **Serviços de Acessibilidade do Android**, o aplicativo poderá ler os dados da notificação de corrida finalizada (valor, distância, etc.). Com apenas um toque na notificação, a corrida será registrada no seu histórico.
                    </p>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Accessibility className="w-5 h-5 text-primary"/> O que são os Serviços de Acessibilidade?</h3>
                    <p className="text-sm text-muted-foreground">
                       É uma ferramenta do Android criada para ajudar usuários, permitindo que apps autorizados leiam o conteúdo da tela. Nosso app usará essa tecnologia de forma focada para identificar e extrair apenas os dados de corridas dos aplicativos de transporte.
                    </p>
                </div>
            </div>
            
            <RideOfferSimulation />

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
                  <li>Não teremos acesso a senhas, mensagens ou qualquer outra informação pessoal. Apenas os dados da corrida serão lidos momentaneamente para o registro.</li>
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
