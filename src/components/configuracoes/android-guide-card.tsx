
"use client"

import { BookOpenCheck, UserCog, DatabaseZap, Youtube, CodeXml } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const xmlExample = `<changes>
  <description>[Resumo das mudanças]</description>
  <change>
    <file>[Caminho completo do arquivo]</file>
    <content><![CDATA[Conteúdo final e completo do arquivo