
"use client";

import { LifeBuoy, PlusCircle, History, BarChart3, Target, Calculator, LayoutDashboard, Gem, Sparkles, Wallet, Smartphone, Rocket, Lightbulb, UserCog, CodeXml, DollarSign, Link as LinkIcon, Compass, Accessibility, BotMessageSquare, ShieldCheck, MessageSquarePlus, MessageCircleQuestion, Share2, Handshake, Users, Trash, Eye, Notebook, FileDown, Github } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";


const helpTopics = [
  {
    value: "planos",
    icon: Gem,
    title: "Qual a diferença entre os planos?",
    content: "O plano Básico (Gratuito) oferece as ferramentas essenciais para começar. O plano Pro eleva sua gestão com o 'TX IA' para analisar corridas, acesso a todos os cards e gráficos, personalização e a futura Auditoria de Rentabilidade. O plano Autopilot (Premium) é a experiência definitiva, com registro simplificado de corridas e todos os outros benefícios.",
    isPremiumFeature: true,
  },
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
    content: "Em 'Relatórios Detalhados', use os filtros de período para gerar análises da sua performance. Usuários do plano Básico verão 4 cards e 2 gráficos fixos. Assinantes Pro ou Autopilot têm acesso a todos os cards e gráficos disponíveis para uma análise completa."
  },
  {
    value: "metas",
    icon: Target,
    title: "Como planejar minhas metas de lucro?",
    content: "Em 'Planejamento Financeiro', no card 'Plano de Metas Mensal', defina seu objetivo de lucro líquido mensal e quantos dias por semana você pretende trabalhar. O sistema calculará automaticamente suas metas diárias e semanais para acompanhar seu progresso no Dashboard e na tela inicial."
  },
  {
    value: "auditoria_rentabilidade",
    icon: BarChart3,
    title: "O que é a Auditoria de Rentabilidade?",
    content: "Esta funcionalidade, que chegará em breve para os planos Pro e Autopilot, será seu consultor pessoal. Ela analisará seus dados e mostrará qual foi o dia mais lucrativo do mês, qual plataforma (Uber, 99, etc.) te pagou melhor por hora, e te dará insights para você focar onde ganha mais.",
    isPremiumFeature: true,
  },
  {
    value: "ganhar_dinheiro",
    icon: Handshake,
    title: "Posso ganhar dinheiro com o Uber Cash TX IA?",
    content: "Com certeza! Acreditamos que o sucesso é melhor quando compartilhado. Por isso, criamos o Programa de Parceiros. Ao se tornar um assinante Pro ou Autopilot, você não apenas desbloqueia todo o potencial do aplicativo para si mesmo, mas também recebe um link exclusivo para indicar a outros motoristas. Cada novo assinante que usar seu link se traduz em uma recompensa para você. É uma chance de criar uma nova fonte de renda enquanto ajuda seus colegas a se tornarem mais lucrativos e a tomarem o controle de suas finanças.",
    isPremiumFeature: true,
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
    title: "Para que serve o Taxímetro Inteligente?",
    content: "O Taxímetro Inteligente é ideal para corridas particulares. Em 'Configurações', defina suas tarifas (bandeirada, preço por km e por minuto). Ao iniciar uma corrida, o app usará o GPS para calcular distância e tempo, mostrando o valor em tempo real. Usuários do plano Básico podem usar o taxímetro uma vez por dia, enquanto assinantes Pro ou Autopilot têm acesso ilimitado.",
  },
   {
    value: "layout",
    icon: LayoutDashboard,
    title: "Posso personalizar o layout dos relatórios?",
    content: "Sim. Usuários do plano Básico podem reordenar os cards e gráficos padrão. Assinantes Pro e Autopilot podem reordenar, adicionar e remover todos os itens disponíveis para uma personalização completa.",
    isPremiumFeature: true
  },
  {
    value: "estatisticas_categoria",
    icon: Sparkles,
    title: "Consigo ver o lucro por cada aplicativo (Uber, 99)?",
    content: "Sim, nos planos Pro e Autopilot! Em 'Relatórios', você terá acesso a gráficos que mostram o ganho médio por hora e por viagem para cada uma das suas categorias de ganhos. Isso permite que você descubra qual plataforma é mais rentável.",
    isPremiumFeature: true
  },
    {
    value: "lembretes_manutencao",
    icon: Gem,
    title: "Como funcionam os lembretes de manutenção?",
    content: "Assinantes Pro e Autopilot podem configurar lembretes ao registrar uma manutenção, seja por data ou por quilometragem. O app irá te avisar na tela inicial quando a próxima manutenção preventiva estiver se aproximando.",
    isPremiumFeature: true
  },
   {
    value: "chamadas",
    icon: Smartphone,
    title: "O que é o Registro Simplificado de Corridas?",
    content: "Esta é a funcionalidade principal do plano Autopilot. Com sua permissão, o app consegue 'ler' a notificação de corrida finalizada de apps como Uber e 99 para registrar o ganho com um toque. Ele também compara o KM da oferta com o KM real da viagem, mostrando se a plataforma foi transparente.",
    isPremiumFeature: true,
  },
];


export default function AjudaPage() {
    const { user } = useAuth();
    const isDeveloper = user?.id === 'Paulo Vitor Tiburcio';

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
                                                    Conheça os Planos
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

            {isDeveloper && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCog className="h-6 w-6 text-primary" />
                            Guia do Desenvolvedor
                        </CardTitle>
                        <CardDescription>
                            Entenda como o aplicativo é estruturado e como você pode interagir comigo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="structure">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <CodeXml className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-left">Estrutura e Interação</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>A estrutura do projeto é baseada em Next.js. As pastas mais importantes são:</p>
                                    <ul>
                                        <li><strong>src/app:</strong> Contém as pastas de cada página (ex: /dashboard).</li>
                                        <li><strong>src/components:</strong> Contém os "pedaços" da interface (ex: botões, cards).</li>
                                        <li><strong>src/services:</strong> Lógica de "backend" para ler/salvar dados dos arquivos JSON.</li>
                                        <li><strong>src/ai:</strong> Fluxos de IA com Genkit (o cérebro das análises).</li>
                                        <li><strong>data:</strong> Contém arquivos JSON globais como o de usuários (`users.json`) e o de catálogos (`catalog.json`).</li>
                                            <li><strong>data/user-data/[userId]:</strong> Contém os dados específicos de cada usuário (dias de trabalho, metas, configurações). Essa estrutura garante que os dados de um usuário não interfiram nos de outro.</li>
                                    </ul>
                                    <h4>Como Falar Comigo</h4>
                                    <p>Para me pedir para fazer alterações, basta me dizer o que você quer em linguagem natural. Por exemplo: "Adicione um novo card no dashboard para mostrar o total de viagens." Eu vou entender, criar um plano e gerar o código XML necessário para aplicar as mudanças. Você não precisa escrever o XML.</p>
                                </div>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="github-sync">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Github className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-left">Manual: Backup do Código no GitHub</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <p>Salvar seu código em uma fonte externa como o GitHub é a melhor forma de garantir que você nunca perca seu trabalho. Este guia mostra como fazer isso pela primeira vez.</p>
                                        <h5 className="font-semibold mt-2">Parte 1: Preparando o GitHub</h5>
                                        <ol>
                                            <li><strong>Crie uma Conta:</strong> Se ainda não tiver, acesse <a href="https://github.com/join" target="_blank" rel="noopener noreferrer">github.com/join</a> e crie uma conta gratuita.</li>
                                            <li>
                                                <strong>Crie um Novo Repositório:</strong>
                                                <ul>
                                                   <li>No canto superior direito, clique no sinal de "+" e selecione <strong>"New repository"</strong>.</li>
                                                   <li>Dê um nome para seu repositório (ex: <code>meu-app-uber-cash</code>).</li>
                                                   <li>Deixe a opção <strong>"Public"</strong> marcada por enquanto (é mais fácil para começar).</li>
                                                   <li><strong>Importante:</strong> NÃO marque nenhuma das caixas "Initialize this repository with". Deixe-as desmarcadas.</li>
                                                   <li>Clique em <strong>"Create repository"</strong>.</li>
                                                </ul>
                                            </li>
                                             <li><strong>Copie a URL do Repositório:</strong> Na próxima página, o GitHub mostrará alguns comandos. Copie a URL que aparece na seção "...or push an existing repository from the command line". Ela será algo como <code>https://github.com/seu-usuario/seu-repositorio.git</code>.</li>
                                        </ol>
                                        
                                        <h5 className="font-semibold mt-4">Parte 2: Sincronizando seu Projeto (Primeira Vez)</h5>
                                        <p>Agora, vamos enviar o código do Firebase Studio para o seu novo repositório no GitHub. Você fará isso usando o terminal aqui no ambiente de desenvolvimento.</p>
                                        <ol>
                                            <li><strong>Abra o Terminal:</strong> Use o terminal integrado do Firebase Studio.</li>
                                            <li>
                                                <strong>Inicialize o Git:</strong> O Git é o sistema que controla as versões do seu código. Se for a primeira vez, rode este comando:
                                                <br/>
                                                <code className="bg-muted px-1 py-0.5 rounded">git init</code>
                                            </li>
                                             <li>
                                                <strong>Configure seu Nome e Email (se for a primeira vez):</strong>
                                                <br/>
                                                <code className="block bg-muted px-1 py-0.5 rounded">git config --global user.name "Seu Nome"</code>
                                                <code className="block bg-muted px-1 py-0.5 rounded">git config --global user.email "seu-email@exemplo.com"</code>
                                            </li>
                                            <li>
                                                <strong>Adicione a URL do seu Repositório:</strong> Diga ao Git para onde enviar o código. Substitua a URL pela que você copiou do GitHub:
                                                <br/>
                                                <code className="bg-muted px-1 py-0.5 rounded">git remote add origin https://github.com/seu-usuario/seu-repositorio.git</code>
                                            </li>
                                             <li>
                                                <strong>Adicione Todos os Arquivos:</strong> Prepare todos os arquivos do projeto para serem enviados:
                                                <br/>
                                                <code className="bg-muted px-1 py-0.5 rounded">git add .</code>
                                            </li>
                                            <li>
                                                <strong>Crie um "Pacote" (Commit):</strong> Crie um ponto na história do seu projeto com uma mensagem descritiva:
                                                <br/>
                                                <code className="bg-muted px-1 py-0.5 rounded">git commit -m "Primeiro commit: versão inicial do projeto"</code>
                                            </li>
                                            <li>
                                                <strong>Envie para o GitHub:</strong> Finalmente, envie tudo para o seu repositório online.
                                                <br/>
                                                <code className="bg-muted px-1 py-0.5 rounded">git push -u origin master</code>
                                                <br/>
                                                <em>Pode ser que o nome da branch principal seja `main`. Se `master` der erro, tente `git push -u origin main`.</em>
                                            </li>
                                        </ol>
                                        <p className="mt-4"><strong>Pronto!</strong> Se você atualizar a página do seu repositório no GitHub, verá todos os arquivos do seu projeto lá. Agora seu trabalho está seguro.</p>
                                         <h5 className="font-semibold mt-4">Como Manter Sincronizado</h5>
                                         <p>Após fazer novas alterações aqui no Firebase Studio, para salvar a nova versão no GitHub, basta rodar os seguintes comandos no terminal:</p>
                                          <code className="block bg-muted px-1 py-0.5 rounded">git add .</code>
                                          <code className="block bg-muted px-1 py-0.5 rounded">git commit -m "Descreva o que você mudou aqui"</code>
                                          <code className="block bg-muted px-1 py-0.5 rounded">git push</code>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="user-management">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-left">Manual: Gerenciar Usuários de Teste</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <p>Para testar os diferentes planos, você pode adicionar ou remover usuários diretamente. O processo é manual e envolve editar um arquivo e uma pasta.</p>
                                        <h4>Como Adicionar um Novo Usuário de Teste:</h4>
                                        <ol>
                                            <li><strong>Edite o Arquivo de Usuários:</strong> Abra o arquivo <code>data/users.json</code>.</li>
                                            <li><strong>Copie um Bloco Existente:</strong> Copie todo o bloco de um usuário de teste existente (desde o <code>{`{`}</code> até o <code>{`}`}</code>, incluindo a vírgula no final se não for o último).</li>
                                            <li><strong>Cole e Altere:</strong> Cole o bloco no final da lista (antes do <code>]</code> final) e altere os seguintes campos:
                                                <ul>
                                                    <li><code>"id"</code>: O novo nome de usuário (ex: "Teste 4").</li>
                                                    <li><code>"passwordHash"</code>: Para testes, você pode manter <code>"hashed_123456"</code>.</li>
                                                    <li><code>"plan"</code>: Defina o plano para este usuário: <code>"basic"</code>, <code>"pro"</code> ou <code>"autopilot"</code>.</li>
                                                </ul>
                                            </li>
                                            <li><strong>Resultado:</strong> Após salvar, o novo usuário poderá fazer login. O aplicativo criará automaticamente a pasta de dados para ele na primeira vez.</li>
                                        </ol>
                                        <h4>Como Remover um Usuário de Teste:</h4>
                                         <ol>
                                            <li><strong>Edite o Arquivo de Usuários:</strong> Abra o arquivo <code>data/users.json</code>.</li>
                                            <li><strong>Delete o Bloco do Usuário:</strong> Encontre o bloco do usuário que você quer remover (ex: "Teste 4") e apague todo o bloco, desde o <code>{`{`}</code> até o <code>{`}`}</code>. Cuidado com as vírgulas para manter o JSON válido.</li>
                                            <li>
                                                <strong>(Opcional, mas Recomendado) Delete a Pasta de Dados:</strong> No navegador de arquivos à esquerda, vá para a pasta <code>data/user-data/</code>. Encontre a pasta com o nome do usuário que você removeu (ex: <code>teste-4</code>) e apague a pasta inteira.
                                                <br/>
                                                <em className="text-xs">Isso garante uma limpeza completa, removendo todos os registros associados àquela conta.</em>
                                            </li>
                                        </ol>
                                         <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                            <p className="font-bold flex items-center gap-2"><Trash className="h-4 w-4" /> Atenção ao Apagar</p>
                                            <p className="text-xs">Apagar a pasta de dados de um usuário é uma ação permanente e não pode ser desfeita. Tenha certeza de que está apagando a conta de teste correta.</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><MessageCircleQuestion className="h-6 w-6 text-primary"/>Ainda precisa de ajuda?</h2>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Se você não encontrou a resposta para sua dúvida, entre em contato com nosso suporte para que possamos te ajudar.
                    </p>
                    <Link href="/suporte">
                      <Button>
                        Entrar em Contato
                      </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
