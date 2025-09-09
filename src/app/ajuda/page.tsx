
"use client";

import { LifeBuoy, PlusCircle, History, BarChart3, Target, Calculator, LayoutDashboard, Gem, Sparkles, Wallet, Smartphone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const helpTopics = [
  {
    value: "registrar",
    icon: PlusCircle,
    title: "Como registrar meus ganhos e despesas?",
    content: "Na tela inicial ou no menu, clique em 'Registrar Hoje' ou 'Outro Dia'. Primeiro, insira KM e horas. Se usar os períodos de trabalho (ex: 08:00-12:00), as horas são calculadas automaticamente. Depois, nas abas seguintes, adicione seus ganhos por categoria e abastecimentos.",
  },
  {
    value: "gerenciar",
    icon: History,
    title: "Como editar ou apagar um registro antigo?",
    content: "Vá para 'Gerenciamento'. Use os filtros para achar um dia. Clique no dia na lista para abrir os detalhes. Você pode editar cada período de trabalho individualmente, adicionar um novo período àquele dia ou apagar todos os registros da data de uma só vez."
  },
  {
    value: "relatorios",
    icon: BarChart3,
    title: "Como funcionam os relatórios?",
    content: "Em 'Relatórios Detalhados', use os filtros de período para gerar análises da sua performance. Você pode ver gráficos, como a evolução do seu lucro, e exportar os dados para PDF ou CSV."
  },
  {
    value: "metas",
    icon: Target,
    title: "Como planejar minhas metas de lucro?",
    content: "Em 'Planejamento Financeiro', no card 'Plano de Metas Mensal', defina seu objetivo de lucro líquido mensal e quantos dias por semana você pretende trabalhar. O sistema calculará automaticamente suas metas diárias e semanais para acompanhar seu progresso no Dashboard e na tela inicial."
  },
  {
    value: "despesas_pessoais",
    icon: Wallet,
    title: "Como controlo minhas despesas pessoais?",
    content: "Na tela 'Planejamento Financeiro', abra o card 'Controle de Despesas Pessoais'. Clique em 'Adicionar Despesa', preencha a descrição, valor, categoria e data. Isso ajuda a ter uma visão completa do seu saldo final no resumo do mês, que considera o lucro do trabalho menos essas despesas."
  },
   {
    value: "calculadora_objetivos",
    icon: Calculator,
    title: "Como usar a Calculadora de Objetivos?",
    content: "Esta ferramenta, no 'Planejamento Financeiro', ajuda a estimar quanto tempo você precisa trabalhar para alcançar um valor específico. Insira o valor do seu objetivo (ex: R$ 500 para um pneu novo), ajuste seu ganho médio por hora se necessário, e a calculadora mostrará o total de horas e dias de trabalho necessários."
  },
   {
    value: "layout",
    icon: LayoutDashboard,
    title: "Posso personalizar o layout dos relatórios?",
    content: "Sim! Em 'Configurações > Personalizar Layout', você pode reordenar todos os cards de estatísticas e os gráficos dos seus relatórios. Assinantes do plano gratuito podem escolher 1 card e 1 gráfico opcional, enquanto assinantes Premium têm acesso a todos os itens e podem organizá-los como quiserem.",
    isPremiumFeature: true
  },
  {
    value: "estatisticas_categoria",
    icon: Sparkles,
    title: "Consigo ver o lucro por cada aplicativo (Uber, 99)?",
    content: "Sim, no plano Premium! Em 'Relatórios', você terá acesso a gráficos que mostram o ganho médio por hora e por viagem para cada uma das suas categorias de ganhos. Isso permite que você descubra qual plataforma é mais rentável para o seu tempo e otimize sua estratégia.",
    isPremiumFeature: true
  },
    {
    value: "lembretes_manutencao",
    icon: Gem,
    title: "Como funcionam os lembretes de manutenção?",
    content: "Assinantes Premium podem configurar lembretes ao registrar uma manutenção. Você pode definir um alerta por data (ex: daqui a 6 meses) ou por quilometragem (ex: a cada 10.000 km). O app irá te avisar na tela inicial quando a próxima manutenção preventiva estiver se aproximando, ajudando a manter seu veículo sempre em dia.",
    isPremiumFeature: true
  },
  {
    value: "taximetro",
    icon: Calculator,
    title: "Para que serve o Taxímetro?",
    content: "O Taxímetro é ideal para corridas particulares. Em 'Configurações', defina suas tarifas (bandeirada, preço por km e por minuto). Ao iniciar uma corrida, o app usará o GPS para calcular distância e tempo, mostrando o valor em tempo real. Ao finalizar, a corrida é salva automaticamente no seu histórico do dia. Usuários gratuitos podem usar o taxímetro uma vez por semana, enquanto assinantes Premium têm acesso ilimitado."
  },
   {
    value: "chamadas",
    icon: Smartphone,
    title: "O que é a captura de chamadas?",
    content: "Esta é uma funcionalidade em desenvolvimento para a versão nativa do aplicativo. O objetivo é que, com sua permissão, o app consiga 'ler' a tela de apps como Uber e 99 para capturar os dados da corrida (valor, distância) e salvá-los automaticamente no seu histórico, permitindo uma análise ainda mais detalhada."
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
                                    <div className="flex items-center gap-3 text-left">
                                        <topic.icon className="h-5 w-5 text-primary shrink-0" />
                                        <span className="font-semibold">{topic.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        <p className="text-foreground/90">{topic.content}</p>
                                        
                                         {topic.isPremiumFeature && (
                                            <Link href="/premium" passHref>
                                                <Button className="mt-2 animate-pulse" variant="default" size="sm">
                                                    <Gem className="mr-2 h-4 w-4" />
                                                    Disponível no Plano Premium
                                                </Button>
                                            </Link>
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
