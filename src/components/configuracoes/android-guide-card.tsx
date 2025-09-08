
"use client"

import { BookOpenCheck, UserCog, DatabaseZap, Youtube, CodeXml } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "../ui/scroll-area"

export function AndroidGuideCard() {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          Guia de Desenvolvimento Nativo (Android)
        </CardTitle>
        <CardDescription>
          Instruções e lembretes para a evolução e manutenção do aplicativo Android.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <DatabaseZap className="h-4 w-4" />
                        <span>O que é o Capacitor.js?</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-2 text-sm text-foreground">
                       <p>O Capacitor é uma ferramenta que "empacota" nosso aplicativo web (feito em Next.js/React) e o transforma em um aplicativo nativo para Android e iOS. Ele cria uma "ponte" que nos permite acessar funcionalidades nativas do celular (como GPS, câmera) diretamente do nosso código JavaScript.</p>
                       <p className="font-semibold">Vantagem Principal: Não precisamos reescrever o aplicativo. Mantemos uma única base de código.</p>
                   </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" />
                        <span>Como Preparar o Ambiente</span>
                    </div>
                </AccordionTrigger>
                 <AccordionContent>
                   <div className="space-y-2 text-sm text-foreground">
                       <p>Para gerar a versão Android, você precisará do Android Studio instalado. O processo é o seguinte:</p>
                       <ol className="list-decimal list-inside space-y-1">
                           <li><span className="font-semibold">Construir o App Web:</span> Execute o comando <code className="font-mono bg-muted p-1 rounded-md">npm run build</code>. Isso cria a pasta `out` com a versão final do site.</li>
                           <li><span className="font-semibold">Sincronizar com Capacitor:</span> Execute <code className="font-mono bg-muted p-1 rounded-md">npx cap sync android</code>. Isso copia os arquivos da web para o projeto Android.</li>
                           <li><span className="font-semibold">Abrir no Android Studio:</span> Execute <code className="font-mono bg-muted p-1 rounded-md">npx cap open android</code>. Isso abrirá o projeto nativo no Android Studio, pronto para ser compilado e executado em um emulador ou dispositivo físico.</li>
                       </ol>
                   </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <CodeXml className="h-4 w-4" />
                        <span>Estrutura de Modificação (XML)</span>
                    </div>
                </AccordionTrigger>
                 <AccordionContent>
                   <div className="space-y-2 text-sm text-foreground">
                     <p>Para que as mudanças de código sejam aplicadas, elas devem ser fornecidas dentro de uma estrutura XML específica. Siga este formato rigorosamente.</p>
                     <p className="font-semibold">Exemplo de estrutura:</p>
                     <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                         <code>
{`<changes>
  <description>[Resumo das mudanças]</description>
  <change>
    <file>[Caminho completo do arquivo]</file>
    <content><![CDATA[Conteúdo final e completo do arquivo