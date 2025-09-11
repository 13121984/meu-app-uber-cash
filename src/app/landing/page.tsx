"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Eye, Rocket, ShieldCheck, Sparkles, Target, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: Rocket,
        title: "Controle Financeiro Completo",
        description: "Saiba exatamente quanto você ganha e gasta. Registre corridas, combustível e manutenções com facilidade."
    },
    {
        icon: Sparkles,
        title: "Análise com Inteligência Artificial",
        description: "Com o TX IA, nosso copiloto inteligente, você analisa ofertas de corrida e toma decisões que colocam mais dinheiro no seu bolso."
    },
    {
        icon: Target,
        title: "Planejamento de Metas",
        description: "Defina seus objetivos de lucro mensais, semanais e diários, e acompanhe seu progresso em tempo real no dashboard."
    },
    {
        icon: Eye,
        title: "Visão de Futuro: Autopilot",
        description: "Nossa tecnologia em desenvolvimento permitirá a captura automática de corridas e auditoria de ganhos, eliminando o trabalho manual."
    }
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Seção Hero */}
      <section className="relative text-center py-20 sm:py-32 bg-secondary overflow-hidden">
         <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom mask-fade-in-out"></div>
        <div className="container mx-auto px-4 relative">
          <div className={cn(
              "mx-auto w-24 h-24 bg-gradient-to-br from-primary to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
          )}>
            <Car className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-headline tracking-tight text-foreground">
            Uber Cash TX IA
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            TX IA Soluções em Viagens. O copiloto financeiro que todo motorista de aplicativo precisa para maximizar os lucros e tomar decisões inteligentes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <a href="#download">
                <Download className="mr-2" />
                Baixar o App
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">Conferir Funcionalidades</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Seção de Features */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline">Por que o Uber Cash TX IA?</h2>
            <p className="mt-2 text-muted-foreground">Ferramentas poderosas para quem vive na estrada.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 p-3 bg-primary/10 rounded-full">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Prova Social/Mockup */}
       <section className="bg-secondary py-20 sm:py-24">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                     <h2 className="text-3xl sm:text-4xl font-bold font-headline">Decida em Segundos com o TX IA</h2>
                     <p className="mt-4 text-lg text-muted-foreground">
                         Chega de aceitar corridas no prejuízo. Nossa IA analisa a oferta e te diz se vale a pena com base nas suas metas de ganho por KM e por hora. Uma decisão inteligente em um piscar de olhos.
                     </p>
                      <ul className="mt-6 space-y-3 text-left">
                         <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Análise instantânea de valor, distância e tempo.</li>
                         <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Recomendação clara: "Bora" ou "Tô Fora".</li>
                         <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Totalmente personalizável com suas metas.</li>
                     </ul>
                </div>
                 <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden border-8 border-slate-800 bg-slate-200 shadow-xl">
                    <Image
                        src="https://picsum.photos/400/800?grayscale"
                        alt="Fundo de mapa da cidade"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-50"
                        data-ai-hint="city map"
                    />
                     <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 bg-background/80 dark:bg-card/80 backdrop-blur-md border-2 border-primary shadow-2xl">
                        <CardHeader className="p-3 text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-primary font-headline text-2xl">
                                <Sparkles className="h-6 w-6"/>
                                Análise Uber Cash
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="flex justify-center items-center gap-3 p-3 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 mb-3">
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
       </section>

      {/* Seção CTA (Call to Action) */}
      <section id="download" className="py-20 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-headline">Pronto para Assumir o Controle?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Baixe o Uber Cash TX IA agora e comece a transformar sua rotina, uma corrida de cada vez.
          </p>
          <div className="mt-8">
            <Button size="lg" className="w-full sm:w-auto" asChild>
                <a href="#">
                    <Download className="mr-2"/>
                    Download para Android
                </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Requisito Mínimo: Android 6.0 (Marshmallow) ou superior.</p>
          </div>
        </div>
      </section>

       {/* Footer */}
       <footer className="bg-secondary py-8">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} Uber Cash TX IA. Todos os direitos reservados.</p>
                 <p className="mt-2">Contato: ubercashtxia@gmail.com | Instagram: @ubercashtxia</p>
                 <p className="mt-2">Desenvolvido com IA no Firebase Studio.</p>
            </div>
       </footer>
    </div>
  );
}
