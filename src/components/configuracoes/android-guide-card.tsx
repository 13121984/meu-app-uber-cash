
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpenCheck, DatabaseZap, UserCog, CodeXml, Youtube } from "lucide-react";

// Exemplos de código como strings para evitar erros de compilação
const xmlExample = `<changes>
  <description>[Resumo das mudanças]</description>
  <change>
    <file>[Caminho completo do arquivo]</file>
    <content><![CDATA[Conteúdo final e completo do arquivo