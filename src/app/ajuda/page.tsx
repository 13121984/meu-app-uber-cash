
"use client";

import { LifeBuoy, BookOpen, PlusCircle, BarChart3, History, Target, Calculator, Smartphone, LayoutDashboard, Youtube, Gem, Sparkles } from "lucide-react";
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
    content: "Acesse os 'Relatórios Detalhados' através do botão na tela 'Gerenciar'. Use os filtros de período para gerar análises aprofundadas da sua performance. Você pode ver gráficos de composição de ganhos, evolução do lucro e muito mais. Também é possível exportar os dados filtrados para PDF ou CSV a qualquer momento."
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
    content: "O Taxímetro Inteligente é ideal para corridas particulares. Configure suas tarifas (bandeirada, preço por km e por minuto) e inicie uma corrida. O app usará o GPS para calcular a distância e o tempo, mostrando o valor final em tempo real. Ao finalizar e confirmar, a corrida é salva automaticamente no seu histórico do dia como um ganho 'Particular'."
  },
   {
    value: "layout",
    icon: LayoutDashboard,
    title: "Posso organizar o layout do aplicativo?",
    content: "Sim! No plano gratuito, você pode escolher 1 card de estatística e 1 gráfico opcional para exibir, além dos itens padrão, e reordená-los como preferir em 'Configurações > Personalizar Layout'. O plano Premium desbloqueia todos os 12 cards e 8 tipos de gráficos, permitindo que você monte um painel com as métricas que mais importam para você, na ordem que quiser."
  },
  {
    value: "estatisticas_categoria",
    icon: Sparkles,
    title: "Consigo ver o lucro por cada aplicativo (Uber, 99)?",
    content: "O plano gratuito oferece um resumo geral da sua performance. Para uma análise profunda e detalhada, o plano Premium é a solução. Com ele, você tem acesso a gráficos que mostram o ganho médio por hora e por viagem para cada uma das suas categorias de ganhos, permitindo que você descubra qual plataforma é mais rentável para o seu tempo."
  },
  {
    value: "vantagens_premium",
    icon: Gem,
    title: "Quais são as vantagens do plano Premium?",
    content: "O plano Premium transforma o Rota Certa em uma ferramenta de gestão financeira completa. Além de todas as funcionalidades gratuitas, você desbloqueia: 1) Cards e gráficos ilimitados no Dashboard e Relatórios. 2) Personalização total da ordem de todos os itens visuais. 3) Gerenciamento de múltiplos veículos. 4) Criação de categorias de ganhos e combustíveis totalmente personalizáveis. 5) Uso ilimitado do Taxímetro. 6) Acesso a todas as futuras funcionalidades e suporte prioritário. É o upgrade ideal para o motorista que leva a sério a sua performance."
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
                                         {topic.value.includes('premium') && (
                                            <Link href="/premium" passHref>
                                                <Button className="mt-2 animate-pulse" variant="default" size="sm">
                                                    <Gem className="mr-2 h-4 w-4" />
                                                    Conheça o Plano Premium
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
