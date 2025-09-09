
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserCog, CodeXml, BrainCircuit, Smartphone, Compass, Layers, BotMessageSquare } from "lucide-react";

const codeStructure = `- src/app: Contém as pastas de cada página (ex: /dashboard).
- src/components: Contém os "pedaços" da interface (ex: botões, cards).
- src/services: Lógica de "backend" para ler/salvar dados.
- src/ai: Fluxos de IA com Genkit.
- data: Arquivos .json onde os dados são salvos.`;

export function AndroidGuideCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <UserCog className="h-6 w-6 text-primary" />
                    Guia do Desenvolvedor (Android Studio)
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
                                <span className="font-semibold text-left">Estrutura de Pastas</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground mb-2">A estrutura do projeto é baseada em Next.js:</p>
                           <pre className="text-xs p-4 rounded-md bg-muted text-foreground whitespace-pre-wrap">{codeStructure}</pre>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="interaction">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-left">Como Falar Comigo</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground">
                            Para me pedir para fazer alterações, basta me dizer o que você quer em linguagem natural. Por exemplo: "Adicione um novo card no dashboard para mostrar o total de viagens." Eu vou entender, criar um plano e gerar o código XML necessário para aplicar as mudanças. Você não precisa escrever o XML.
                           </p>
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
                                <span className="font-semibold text-left">Permissões e GPS</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground">
                            Para funcionalidades como o Taxímetro, o app precisa de permissão de GPS. No Android, essa permissão precisa ser declarada no arquivo <code className="bg-muted px-1 py-0.5 rounded">AndroidManifest.xml</code>. Também é importante garantir que o GPS esteja habilitado no emulador ou dispositivo físico durante os testes.
                           </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="background">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-left">Rodando em Segundo Plano (Taxímetro)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="prose prose-sm dark:prose-invert">
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
                                <span className="font-semibold text-left">Analisador de Corridas com IA</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="prose prose-sm dark:prose-invert">
                             <p>A funcionalidade de análise de corridas utiliza IA para extrair dados de um print da tela e dar um veredito.</p>
                             <ul className="list-disc pl-5">
                                <li><strong>Fluxo de IA:</strong> A lógica principal está em <code>src/ai/flows/analise-corrida-flow.ts</code>. Este fluxo usa o Gemini para interpretar a imagem.</li>
                                <li><strong>Interface:</strong> A página para o usuário interagir com essa funcionalidade está em <code>src/app/analisador/page.tsx</code>.</li>
                                <li><strong>Dados do Usuário:</strong> As metas de ganhos (R$/km, R$/hora) do usuário para a análise são salvas nas preferências do usuário, gerenciadas pelo <code>src/services/auth.service.ts</code>.</li>
                             </ul>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                 </Accordion>
            </CardContent>
        </Card>
    );
}
