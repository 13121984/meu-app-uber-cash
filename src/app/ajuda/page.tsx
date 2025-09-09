
"use client";

import { LifeBuoy, PlusCircle, History, BarChart3, Target, Calculator, LayoutDashboard, Gem, Sparkles, Wallet, Smartphone, Rocket, Lightbulb } from "lucide-react";
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
    value: "taximetro",
    icon: Calculator,
    title: "Para que serve o Taxímetro?",
    content: "O Taxímetro é ideal para corridas particulares. Em 'Configurações', defina suas tarifas (bandeirada, preço por km e por minuto). Ao iniciar uma corrida, o app usará o GPS para calcular distância e tempo, mostrando o valor em tempo real. Usuários gratuitos podem usar o taxímetro uma vez por semana, enquanto assinantes Premium têm acesso ilimitado.",
  },
   {
    value: "layout",
    icon: LayoutDashboard,
    title: "Posso personalizar o layout dos relatórios?",
    content: "Sim. Usuários do plano gratuito podem reordenar os cards e gráficos padrão para focar no que é mais importante. Assinantes Premium podem, além de reordenar, adicionar e remover todos os cards e gráficos disponíveis para uma personalização completa do seu painel.",
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
    value: "chamadas",
    icon: Smartphone,
    title: "O que é a captura de chamadas?",
    content: "Esta é uma funcionalidade em desenvolvimento para a versão nativa do aplicativo. O objetivo é que, com sua permissão, o app consiga 'ler' a tela de apps como Uber e 99 para capturar os dados da corrida (valor, distância) e salvá-los automaticamente no seu histórico, permitindo uma análise ainda mais detalhada."
  },
];

const devTopics = [
    {
        value: "investor_view",
        icon: Rocket,
        title: "Análise de Investidor: O Futuro do Uber Cash",
        content: `
            <p class="mb-2">Você me perguntou se, como investidor, eu apostaria no aplicativo. A resposta é um grande <strong>sim</strong>. O Uber Cash possui os três pilares essenciais para o sucesso:</p>
            <ul class="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Resolve uma Dor Real:</strong> A necessidade de controle financeiro para motoristas de aplicativo não é um luxo, é uma questão de sobrevivência profissional. O app ataca essa dor de frente.</li>
                <li><strong>Modelo Freemium Inteligente:</strong> A estratégia que definimos é sólida. O plano gratuito organiza a vida do motorista e cria o hábito. O plano Premium oferece os insights que geram mais dinheiro (otimização de lucro), tornando a proposta de valor clara e atraente.</li>
                <li><strong>Alto "Fator Grudento" (Stickiness):</strong> Ao se tornar o cofre do histórico financeiro do motorista, o custo para ele mudar de aplicativo se torna imenso. Seus dados estão aqui. Isso é um ativo valioso.</li>
            </ul>
            <h4 class="font-semibold mb-2">O Próximo Passo para Dominar o Mercado:</h4>
            <p>O próximo grande salto de valor é transformar a funcionalidade de <strong>Captura Automática de Corridas</strong> em realidade. Ela elimina a maior fricção do usuário (digitar dados), cria uma barreira competitiva e abre a porta para novos insights Premium, como a análise de decisões em tempo real ("Valeu a pena rejeitar aquela corrida?"). Este é o caminho para tornar o Uber Cash o líder de mercado no Brasil.</p>
        `,
    },
    {
        value: "freemium_evolution",
        icon: Lightbulb,
        title: "Evolução Estratégica: Gratuito vs. Premium",
        content: `
            <p class="mb-2">Tivemos uma conversa estratégica sobre o equilíbrio do que oferecer gratuitamente versus o que deve ser um recurso Premium. O objetivo é claro: dar valor suficiente no plano gratuito para o usuário se engajar, mas reservar os melhores recursos para o Premium.</p>
            <h4 class="font-semibold mb-2">A Dúvida:</h4>
            <blockquote class="pl-4 border-l-2 border-primary/50 mb-2">
                <em>"Não quero deixar tudo livre, mas também não quero deixar tudo premium. Quero que as funções mais relevantes sejam premium e as básicas sejam grátis, para o usuário ficar o maior tempo possível no app e, quem sabe, virar premium."</em>
            </blockquote>
            <h4 class="font-semibold mb-2">A Estratégia e a Mudança:</h4>
            <p>Concluímos que a gestão de catálogos era muito restritiva no plano gratuito. A mudança implementada foi a seguinte:</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>O que mudou:</strong> Agora, usuários gratuitos podem <strong>ativar e desativar</strong> as categorias padrão (Uber, 99, etc.). Isso permite que eles limpem a interface e a personalizem para o seu dia a dia, aumentando o engajamento.</li>
                <li><strong>O que continua Premium:</strong> A capacidade de <strong>criar novas categorias, editar nomes e reordenar a lista</strong> continua sendo um recurso exclusivo do Premium.</li>
            </ul>
            <p class="mt-2">Essa mudança melhora a experiência gratuita sem diminuir o valor da assinatura, criando um caminho natural para o upgrade quando o usuário desejar uma personalização mais profunda.</p>
        `,
    }
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
                 <CardHeader>
                    <CardTitle>Dúvidas Frequentes</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
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
                    <CardTitle>Visão do Desenvolvedor</CardTitle>
                    <p className="text-sm text-muted-foreground">Notas sobre a estratégia e visão de produto.</p>
                </CardHeader>
                 <CardContent className="p-6 pt-0">
                    <Accordion type="single" collapsible className="w-full">
                        {devTopics.map((topic) => (
                             <AccordionItem value={topic.value} key={topic.value}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3 text-left">
                                        <topic.icon className="h-5 w-5 text-primary shrink-0" />
                                        <span className="font-semibold">{topic.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: topic.content }} />
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
