
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserCog, CodeXml, BrainCircuit, Smartphone, Compass } from "lucide-react";

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
                 </Accordion>
            </CardContent>
        </Card>
    );
}
