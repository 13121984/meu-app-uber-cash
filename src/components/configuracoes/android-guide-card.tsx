
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpenCheck, DatabaseZap, UserCog, CodeXml, Youtube, BrainCircuit, Smartphone, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const codeStructure = `
- src/app: Contém as pastas de cada página (ex: /dashboard, /metas).
- src/components: Contém os "pedaços" reutilizáveis da interface (ex: botões, cards).
- src/services: Lógica de "backend" para ler e salvar dados nos arquivos JSON.
- src/ai: Onde a mágica da IA acontece, com os fluxos do Genkit.
- data: Onde seus dados (usuários, registros, etc.) são salvos em arquivos .json.
`;

const xmlExample = `<changes>
  <description>Um resumo do que eu fiz.</description>
  <change>
    <file>/src/app/minha-pagina/page.tsx</file>
    <content><![CDATA[
      // O conteúdo completo e final do arquivo vai aqui.
      // Eu sempre reescrevo o arquivo inteiro para evitar erros.
    
    