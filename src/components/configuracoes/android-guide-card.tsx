
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserCog, CodeXml, BrainCircuit, Smartphone, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const codeStructure = `- src/app: Contém as pastas de cada página (ex: /dashboard).
- src/components: Contém os "pedaços" da interface (ex: botões, cards).
- src/services: Lógica de "backend" para ler/salvar dados.
- src/ai: Fluxos de IA com Genkit.
- data: Arquivos .json onde os dados são salvos.`;

const xmlExample = `<changes>
  <description>Resumo do que foi feito.</description>
  <change>
    <file>/src/app/page.tsx</file>
    <content><![CDATA[// O conteúdo completo e final do arquivo vai aqui.
// Eu sempre reescrevo o arquivo inteiro para evitar erros.
