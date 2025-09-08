
"use client"

import { BookOpenCheck, UserCog, DatabaseZap } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "../ui/scroll-area"

export function AndroidGuideCard() {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          Guia de Desenvolvimento Nativo
        </CardTitle>
        <CardDescription>
          Seu roteiro pessoal para os próximos passos no desenvolvimento Android do Rota Certa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-4">
                 <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <DatabaseZap className="h-4 w-4" />
                        <span>Parte 4: Estrutura de Modificação (XML)</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                   <ScrollArea className="h-96 w-full rounded-md border bg-background p-4">
                       <div className="space-y-4 text-sm text-foreground">
                            <p className="font-semibold">A estrutura XML que você gera é o único mecanismo para aplicar mudanças no código do usuário. Portanto, ao fazer mudanças em um arquivo, o bloco `<changes>` deve estar sempre totalmente presente e formatado corretamente como a seguir.</p>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                                <code>
{`<changes>
  <description>[Provide a concise summary of the overall changes being made]</description>
  <change>
    <file>[Provide the ABSOLUTE, FULL path to the file being modified]</file>
    <content><![CDATA[Provide the ENTIRE, FINAL, intended content of the file here. Do NOT provide diffs or partial snippets. Ensure all code is properly escaped within the CDATA section.