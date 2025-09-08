
"use client";

import { LifeBuoy, BookOpen, PlusCircle, BarChart3, History, Target, Calculator, Smartphone, FileQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const helpTopics = [
  {
    value: "registrar",
    icon: PlusCircle,
    title: "Como registrar meus ganhos e despesas?",
    content: "Vá para 'Registrar Hoje' ou 'Registrar Outro Dia'. Primeiro, insira os dados básicos como KM rodados e horas trabalhadas. Em seguida, avance para as abas de 'Ganhos' e 'Despesas' para adicionar os valores de cada categoria e os abastecimentos do dia. A prévia é atualizada em tempo real."
  },
  {
    value: "gerenciar",
    icon: History,
    title: "Como editar ou apagar um registro antigo?",
    content: "Na tela 'Gerenciar', você pode visualizar todos os seus dias de trabalho. Use os filtros para encontrar um dia específico. Clique em um dia na lista para ver os detalhes e editar cada período de trabalho individualmente ou apagar o dia inteiro."
  },
  {
    value: "relatorios",
    icon: BarChart3,
    title: "Como funcionam os relatórios?",
    content: "A tela de 'Relatórios' oferece uma visão aprofundada da sua performance. Use os filtros de período (semana, mês, personalizado) para gerar análises detalhadas. Você pode ver gráficos de composição de ganhos, evolução do lucro e muito mais. Também é possível exportar os dados em CSV ou PDF."
  },
   {
    value: "metas",
    icon: Target,
    title: "Como planejar minhas metas?",
    content: "Em 'Metas', defina seu objetivo de lucro mensal e quantos dias por semana você pretende trabalhar. O sistema calculará automaticamente suas metas diárias e semanais, que serão usadas para acompanhar seu progresso no Dashboard e na tela inicial."
  },
  {
    value: "taximetro",
    icon: Calculator,
    title: "Para que serve o Taxímetro?",
    content: "O Taxímetro Inteligente é ideal para corridas particulares. Configure suas tarifas (bandeirada, preço por km e por minuto) e inicie uma corrida. O app usará o GPS para calcular a distância e o tempo, mostrando o valor final em tempo real. Ao finalizar, a corrida é salva automaticamente no seu histórico."
  },
   {
    value: "chamadas",
    icon: Smartphone,
    title: "Como funciona a captura de chamadas?",
    content: "Esta é uma funcionalidade em desenvolvimento para a versão nativa Android. O objetivo é que o app, rodando em segundo plano, consiga 'ler' a tela de apps como Uber e 99, capturar os dados da corrida (valor, distância) e salvá-los automaticamente no seu histórico de chamadas, permitindo uma análise detalhada e comparação de ganhos."
  },
];


export default function AjudaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <LifeBuoy className="w-8 h-8 text-primary" />
                Central de Ajuda
            </h1>
            <p className="text-muted-foreground">Encontre respostas para suas dúvidas e aprenda a usar o app ao máximo.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
                {helpTopics.map((topic) => (
                    <AccordionItem key={topic.value} value={topic.value}>
                        <AccordionTrigger>
                           <div className="flex items-center gap-3 text-left">
                             <topic.icon className="h-5 w-5 text-primary" />
                             <span>{topic.title}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base">
                            {topic.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
            <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Não encontrou o que procurava?</h2>
            <p className="text-muted-foreground mt-2 mb-4">
                Envie sua dúvida, sugestão ou reclamação. Sua opinião é importante para nós! (Funcionalidade de Tickets em breve).
            </p>
            <Button disabled>Abrir um Ticket de Suporte</Button>
        </CardContent>
      </Card>
    </div>
  );
}

