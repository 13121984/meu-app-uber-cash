
"use client";

import { LifeBuoy, PlusCircle, History, BarChart3, Target, Calculator, LayoutDashboard, Gem, Sparkles, Wallet, Smartphone, Rocket, Lightbulb, UserCog, CodeXml, DollarSign, Link as LinkIcon, Compass, Accessibility, BotMessageSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        title: "Análise de Investidor: O Futuro do Rota Certa",
        content: `
            <p class="mb-2">Você me perguntou se, como investidor, eu apostaria no aplicativo. A resposta é um grande <strong>sim</strong>, e a razão é a visão estratégica que estamos construindo:</p>
            <ul class="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Resolve uma Dor Real:</strong> A necessidade de controle financeiro para motoristas de aplicativo não é um luxo, é uma questão de sobrevivência profissional.</li>
                <li><strong>Vantagem Competitiva Clara:</strong> A sua visão de suportar <strong>múltiplos aplicativos de corrida</strong>, incluindo os regionais como MD Drivers e InDriver, é o maior diferencial. A maioria dos concorrentes foca apenas em Uber e 99. Nós seremos a solução universal.</li>
                <li><strong>Modelo Freemium Inteligente:</strong> O plano gratuito organiza a vida do motorista e cria o hábito. O plano Premium oferece os insights que geram mais dinheiro (otimização de lucro), tornando a assinatura uma decisão fácil.</li>
                <li><strong>Alto "Fator Grudento" (Stickiness):</strong> Ao se tornar o cofre do histórico financeiro do motorista, o custo para ele mudar de aplicativo se torna imenso. Seus dados estão aqui.</li>
            </ul>
            <h4 class="font-semibold mb-2">O Próximo Passo para Dominar o Mercado:</h4>
            <p>Com essa base, a <strong>Captura Automática de Corridas</strong> se torna o próximo grande salto. Ela elimina a maior fricção do usuário (digitar dados), cria uma barreira competitiva intransponível e abre a porta para novos insights Premium, como a análise de decisões em tempo real ("Valeu a pena rejeitar aquela corrida?").</p>
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
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="h-6 w-6 text-primary" />
                        Guia Técnico do Desenvolvedor
                    </CardTitle>
                    <CardDescription>
                        Entenda como o aplicativo é estruturado e como você pode interagir comigo para fazer alterações.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
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
                                       <li><strong>data:</strong> Arquivos .json onde os dados são salvos.</li>
                                   </ul>
                                   <h4>Como Falar Comigo</h4>
                                   <p>Para me pedir para fazer alterações, basta me dizer o que você quer em linguagem natural. Por exemplo: "Adicione um novo card no dashboard para mostrar o total de viagens." Eu vou entender, criar um plano e gerar o código XML necessário para aplicar as mudanças. Você não precisa escrever o XML.</p>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="pricing">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-left">Alterar Preço e Link de Pagamento</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>Para alterar o preço da assinatura e o link de pagamento da Hotmart (ou outra plataforma), edite o arquivo:</p>
                                    <p><code>src/app/premium/page.tsx</code></p>
                                    <p>Dentro deste arquivo, localize a seguinte constante no início do código e altere seu valor:</p>
                                    <ul>
                                        <li><code>YOUR_CHECKOUT_LINK</code>: O link da sua página de vendas do produto na Hotmart.</li>
                                    </ul>
                                    <p>O valor exibido na página (ex: R$ 59,90) está diretamente no código JSX, dentro do card de preço. Você pode alterá-lo lá para corresponder ao preço configurado na plataforma de pagamento.</p>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="webhook">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-left">Automatizar Acesso Premium com Webhook</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>Para que o acesso Premium seja liberado automaticamente após a compra, você precisa usar um webhook. Como nosso app é estático, o ideal é usar uma função na nuvem (Cloud Function) para isso.</p>
                                    <h4>Passos Recomendados:</h4>
                                    <ol>
                                        <li><strong>Criar Projeto Firebase:</strong> Crie um novo projeto no <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase</a>.</li>
                                        <li>
                                            <strong>Configurar o Webhook:</strong> Criei um arquivo de esqueleto para você em <code>src/app/api/hotmart-webhook/route.ts</code>. Você precisará adaptar e implantar este código como uma Firebase Function. Esta função irá:
                                            <ul className="list-disc pl-5">
                                                <li>Receber a notificação da Hotmart.</li>
                                                <li>Verificar a assinatura para segurança.</li>
                                                <li>Encontrar o usuário no seu <code>users.json</code> pelo e-mail.</li>
                                                <li>Mudar o status <code>isPremium</code> do usuário para <code>true</code>.</li>
                                            </ul>
                                        </li>
                                         <li><strong>Configurar na Hotmart:</strong> Na sua conta da Hotmart, vá nas configurações do produto e adicione a URL da sua Firebase Function no campo de Webhook (ou "Postback URL").</li>
                                         <li><strong>Importante:</strong> Para que a Firebase Function possa editar seu arquivo <code>users.json</code>, ele precisará estar em um local acessível, como o Firebase Storage ou Realtime Database. Você precisará ajustar o código no webhook para ler/escrever nesse local.</li>
                                    </ol>
                                    <p>Isso parece complexo, mas é o caminho padrão para automatizar esse tipo de processo de forma segura e escalável.</p>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                          <AccordionItem value="android">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-left">Geração do App Android</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <p className="text-sm text-muted-foreground">
                                Para gerar a versão Android, você pode usar o comando <code className="bg-muted px-1 py-0.5 rounded">npm run android</code>. Isso irá construir a versão web do app e abri-la no Android Studio. Você precisará ter o Java e o Android Studio configurados no seu ambiente.
                               </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="gps">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Compass className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-left">Taxímetro: Permissões e GPS</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                 <p>Para que o Taxímetro continue funcionando mesmo com o app minimizado, você precisará de um plugin do Capacitor que gerencie tarefas em segundo plano e permissões específicas.</p>
                                 <h4>Passos no Android Studio:</h4>
                                 <ol>
                                    <li>
                                        <strong>Instalar o Plugin:</strong> Você precisará de um plugin da comunidade para geolocalização em segundo plano. Um exemplo popular é o <a href="https://github.com/capacitor-community/background-geolocation" target="_blank" rel="noopener noreferrer">Capacitor Background Geolocation</a>.
                                        <br />
                                        Instale-o com: <code className="bg-muted px-1 py-0.5 rounded">npm install @capacitor-community/background-geolocation</code> e sincronize com o Capacitor: <code className="bg-muted px-1 py-0.5 rounded">npx cap sync</code>.
                                    </li>
                                    <li>
                                        <strong>Adicionar Permissões:</strong> No arquivo <code>android/app/src/main/AndroidManifest.xml</code>, adicione as seguintes permissões dentro da tag <code>&lt;manifest&gt;</code>:
                                        <pre className="text-xs p-2 rounded-md bg-muted text-foreground whitespace-pre-wrap">{
    `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />`
                                        }</pre>
                                    </li>
                                    <li>
                                        <strong>Implementar no Código:</strong> No arquivo <code>src/components/taximetro/taximeter-client.tsx</code>, localize as funções <code>startTracking</code> e <code>stopTracking</code>. Você precisará substituir as chamadas do <code>@capacitor/geolocation</code> pelas funções do plugin de background geolocation que você instalou. A estrutura do código já está preparada para essa substituição.
                                    </li>
                                 </ol>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="analyzer">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <BotMessageSquare className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-left">Analisador de Corridas com IA (Print)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                 <p>A funcionalidade de análise de corridas utiliza IA para extrair dados de um print da tela e dar um veredito.</p>
                                 <ul className="list-disc pl-5">
                                    <li><strong>Fluxo de IA:</strong> A lógica principal está em <code>src/ai/flows/analise-corrida-flow.ts</code>. Este fluxo usa o Gemini para interpretar a imagem.</li>
                                    <li><strong>Interface:</strong> A página para o usuário interagir com essa funcionalidade está em <code>src/app/analisador/page.tsx</code>.</li>
                                    <li><strong>Dados do Usuário:</strong> As metas de ganhos (R$/km, R$/hora) do usuário para a análise são salvas nas preferências do usuário, gerenciadas pelo <code>src/services/auth.service.ts</code>.</li>
                                 </ul>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="auto-capture">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <Accessibility className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-left">Visão de Futuro: Captura Automática</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                 <p>Esta é a evolução natural e o recurso mais poderoso do aplicativo. Ele permite que o app leia a tela de outros aplicativos (Uber, 99, etc.) para analisar ofertas e registrar corridas finalizadas, <strong>tudo de forma automática.</strong></p>
                                 <h4>O Fluxo Ideal (Visão de Produto):</h4>
                                 <ol>
                                    <li><strong>Análise da Oferta:</strong> Quando uma oferta de corrida aparece, o app lê os dados (valor, distância, tempo) e exibe uma pequena notificação com a recomendação "Bora" ou "Tô Fora".</li>
                                    <li><strong>Detecção de Finalização:</strong> Após o motorista aceitar e completar a corrida, o app detecta a tela de resumo/finalização da viagem.</li>
                                    <li><strong>Registro 100% Automático:</strong> O app extrai os dados finais e salva a corrida no histórico do Rota Certa, sem que o motorista precise fazer nada.</li>
                                 </ol>
                                 <h4>Como Funciona Tecnicamente? (Android)</h4>
                                 <p>Isso é feito com um <strong>Serviço de Acessibilidade</strong> no Android, que precisa ser habilitado pelo usuário. Ele permite que o nosso app leia o texto exibido na tela de outros apps.</p>
                                 <ul className="list-disc pl-5">
                                    <li><strong>Desenvolvimento Nativo:</strong> A criação deste serviço é feita em código nativo (Java/Kotlin) no Android Studio.</li>
                                    <li><strong>Configuração (Manifest):</strong> É preciso registrar o serviço no arquivo <code>AndroidManifest.xml</code> e criar uma configuração em XML para especificar quais apps e eventos monitorar (ex: monitorar o app da Uber quando uma janela de oferta aparece).</li>
                                     <li><strong>Lógica de Extração:</strong> O serviço precisa ser inteligente para identificar os textos corretos de "valor", "distância", etc., em meio a todas as outras informações na tela.</li>
                                    <li><strong>Comunicação:</strong> Os dados extraídos pelo serviço nativo são enviados para a parte web do nosso app (WebView) para serem processados e salvos.</li>
                                 </ul>
                                 <p className="mt-2">Esta é uma implementação complexa que exige conhecimento do SDK do Android, mas é o que diferencia um app útil de um app indispensável.</p>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Visão do Produto</CardTitle>
                    <p className="text-sm text-muted-foreground">Notas sobre a estratégia e visão de futuro.</p>
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

    

    
