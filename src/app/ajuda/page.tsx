
"use client";

import { LifeBuoy, BookOpen, PlusCircle, BarChart3, History, Target, Calculator, Smartphone, FileQuestion, DatabaseZap, UserCog, CodeXml, Youtube } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const helpTopics = [
  {
    value: "registrar",
    icon: PlusCircle,
    title: "Como registrar meus ganhos e despesas?",
    content: "Na tela inicial, use os botões 'Registrar Hoje' ou 'Outro Dia'. Você também pode usar o botão de '+' no menu superior. Primeiro, insira os dados básicos como KM rodados e horas trabalhadas. Em seguida, avance para as abas de 'Ganhos' e 'Despesas' para adicionar os valores de cada categoria e os abastecimentos do dia. A prévia é atualizada em tempo real.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    value: "gerenciar",
    icon: History,
    title: "Como editar ou apagar um registro antigo?",
    content: "Na tela 'Gerenciar', você pode visualizar todos os seus dias de trabalho. Use os filtros para encontrar um dia específico. Clique em um dia na lista para ver os detalhes, editar cada período de trabalho individualmente ou apagar todos os registros daquele dia."
  },
  {
    value: "relatorios",
    icon: BarChart3,
    title: "Como funcionam os relatórios?",
    content: "Acesse os 'Relatórios Detalhados' através do botão na tela 'Gerenciar'. Use os filtros de período para gerar análises aprofundadas da sua performance. Você pode ver gráficos de composição de ganhos, evolução do lucro e muito mais. Também é possível exportar os dados filtrados em CSV ou PDF."
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
    content: "Esta é uma funcionalidade em desenvolvimento para a versão nativa Android, que pode ser acessada através da tela 'Gerenciar'. O objetivo é que o app, rodando em segundo plano, consiga 'ler' a tela de apps como Uber e 99, capturar os dados da corrida (valor, distância) e salvá-los automaticamente no seu histórico de chamadas, permitindo uma análise detalhada e comparação de ganhos."
  },
];


export default function AjudaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                    <LifeBuoy className="w-8 h-8 text-primary" />
                    Central de Ajuda
                </h1>
                <p className="text-muted-foreground">Tire suas dúvidas sobre as funcionalidades do aplicativo.</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                        {helpTopics.map((topic) => (
                             <AccordionItem value={topic.value} key={topic.value}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3">
                                        <topic.icon className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-left">{topic.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        <p className="text-foreground/90">{topic.content}</p>
                                        {topic.videoUrl && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold mb-2">Tutorial em Vídeo:</h4>
                                                <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={topic.videoUrl}
                                                        title={topic.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-2xl font-bold font-headline">Ainda precisa de ajuda?</h2>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Se você não encontrou a resposta para sua dúvida, entre em contato com nosso suporte.
                    </p>
                    <Link href="mailto:pvitormc@gmail.com">
                      <Button>
                        Entrar em Contato
                      </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
