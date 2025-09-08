
"use client"

import { BookOpenCheck, Code, FileText } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "../ui/scroll-area"

export function AndroidGuideCard() {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          Guia de Desenvolvimento Nativo
        </CardTitle>
        <CardDescription>
          Seu roteiro pessoal para os próximos passos no desenvolvimento Android do Rota Certa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                 <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Parte 1: Implementando o Capturador de Corridas</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-96 w-full rounded-md border bg-background p-4">
                       <div className="space-y-4 text-sm text-foreground">
                            <h3 className="font-bold text-lg">Conceito Geral</h3>
                            <p>O sistema funcionará com um <strong>"Serviço"</strong> que roda em segundo plano no Android. Ele vai:</p>
                            <ol className="list-decimal list-inside space-y-2 pl-4">
                                <li><strong>Detectar a Corrida:</strong> Usar um <strong>Serviço de Acessibilidade</strong> para "ler" o texto na tela quando os apps da Uber ou 99 estiverem abertos.</li>
                                <li><strong>Tirar uma Foto:</strong> Usar a <strong>API MediaProjection</strong> para capturar uma imagem da tela da corrida.</li>
                                <li><strong>Analisar e Exibir:</strong> Mostrar um <strong>Widget Flutuante (Overlay)</strong> com os dados da corrida e a análise de ganhos.</li>
                                <li><strong>Salvar no App:</strong> Enviar os dados da corrida (valor, distância, etc.) de volta para o Rota Certa para salvar no histórico.</li>
                            </ol>

                            <hr className="my-4"/>

                            <h3 className="font-bold text-lg">Passo a Passo para o Desenvolvedor</h3>
                            
                            <h4 className="font-semibold">Passo 1: Abrir o Projeto no Android Studio</h4>
                            <p>Dentro da pasta do seu projeto, localize a subpasta `android`. Abra esta pasta `android` como um projeto no Android Studio.</p>

                             <h4 className="font-semibold">Passo 2: Adicionar as Permissões no `AndroidManifest.xml`</h4>
                            <p>Localize o arquivo em: `android/app/src/main/AndroidManifest.xml`. Adicione as seguintes permissões dentro da tag `&lt;manifest&gt;`:</p>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                                <code>
{`<!-- Permissão para desenhar sobre outros apps (o widget flutuante) -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

<!-- Permissão para rodar o serviço em segundo plano -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- Permissão para o serviço de acessibilidade (será configurado em um arquivo separado) -->
<!-- Não é uma "uses-permission", mas sim a declaração do serviço -->`}
                                </code>
                            </pre>

                            <h4 className="font-semibold">Passo 3: Criar o Serviço de Acessibilidade</h4>
                            <p>Este é o "cérebro" da operação. Será uma nova classe (ex: `RideCaptureService.java` ou `.kt`).</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li><strong>O que ele faz:</strong> É configurado para observar eventos nos apps da Uber (`com.ubercab.driver`) e 99 (`com.taxis99`).</li>
                                <li>Quando uma nova janela ou texto aparece nesses apps, o Android notifica este serviço.</li>
                                <li>O código dentro do serviço irá percorrer os elementos da tela para extrair textos como "Nova Viagem", valor, distância e tempo.</li>
                                <li><strong>Como registrar:</strong> Você precisará declarar este serviço no `AndroidManifest.xml` e criar um arquivo de configuração XML em `res/xml/` para especificar quais apps ele deve observar.</li>
                            </ul>

                             <h4 className="font-semibold">Passo 4: Criar o Serviço em Primeiro Plano (Foreground Service)</h4>
                            <p>Este é o "coração" que mantém o app vivo.</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li><strong>O que ele faz:</strong> Garante que o Android não feche seu app enquanto ele está em segundo plano.</li>
                                <li>Exibe uma notificação persistente para o usuário (ex: "Rota Certa está protegendo suas corridas").</li>
                                <li><strong>Como funciona:</strong> Este serviço é iniciado quando o usuário ativa a funcionalidade de captura e é ele quem vai gerenciar o widget flutuante.</li>
                            </ul>

                            <h4 className="font-semibold">Passo 5: Implementar o Widget Flutuante e a Captura de Tela</h4>
                             <p>Quando o Serviço de Acessibilidade detecta uma nova corrida, ele se comunica com o Serviço em Primeiro Plano. O Serviço em Primeiro Plano, então:</p>
                             <ol className="list-decimal list-inside space-y-1 pl-4">
                                 <li>Usa a API `MediaProjection` para solicitar permissão e capturar a tela.</li>
                                 <li>Usa o `WindowManager` do Android para adicionar uma nova "view" (o widget flutuante) na tela.</li>
                                 <li>Salva a imagem capturada e os dados da corrida.</li>
                             </ol>

                             <h4 className="font-semibold">Passo 6: Comunicar com a Interface Web (Capacitor)</h4>
                            <p>Esta é a ponte de volta para o seu app. Você precisará criar um <strong>Plugin do Capacitor customizado</strong>.</p>
                             <ol className="list-decimal list-inside space-y-1 pl-4">
                                 <li><strong>Criar o Plugin:</strong> Siga a documentação do Capacitor para criar um novo plugin (ex: `RideCapturePlugin`).</li>
                                 <li><strong>Definir um Evento:</strong> O plugin terá um método para notificar a parte web. Por exemplo, você pode criar um evento chamado `rideCaptured`.</li>
                                 <li><strong>Enviar os Dados:</strong> A parte nativa (seu serviço Android) chamará este plugin e passará os dados da corrida (JSON com valor, distância, etc.) e a imagem (como uma string base64).</li>
                                 <li><strong>Receber os Dados no App:</strong> Na sua página `/historico-chamadas`, você usará a biblioteca do Capacitor para "ouvir" o evento `rideCaptured`. Quando o evento for recebido, você atualizará a tela com os novos dados.</li>
                             </ol>
                       </div>
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-2">
                 <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>Parte 2: Gerando os Arquivos para Publicação (APK e AAB)</span>
                    </div>
                 </AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-96 w-full rounded-md border bg-background p-4">
                        <div className="space-y-4 text-sm text-foreground">
                            <p>Depois que seu aplicativo estiver pronto, você precisará gerar os arquivos para testar e para publicar na Google Play Store.</p>
                            <h3 className="font-bold text-lg">O que é APK e AAB?</h3>
                             <ul className="list-disc list-inside space-y-1 pl-4">
                                <li><strong>APK (`Android Package Kit`):</strong> É o arquivo que você pode instalar diretamente no seu celular para testar.</li>
                                <li><strong>AAB (`Android App Bundle`):</strong> É o formato que você envia para a Google Play Store. A loja usa o AAB para gerar APKs otimizados para cada tipo de celular.</li>
                            </ul>

                             <h3 className="font-bold text-lg">Passo a Passo no Android Studio</h3>
                             <ol className="list-decimal list-inside space-y-2 pl-4">
                                 <li>
                                     <strong>Sincronizar o Projeto Web:</strong><br/>
                                     Antes de qualquer coisa, rode este comando no terminal, na pasta raiz do seu projeto:<br/>
                                     <pre className="bg-muted p-2 rounded-md my-1 text-xs"><code>npx cap sync android</code></pre>
                                     Isso garante que a versão mais recente do seu código Next.js seja copiada para o projeto Android.
                                 </li>
                                 <li><strong>Abrir o Android Studio:</strong> Abra a pasta `android` no Android Studio.</li>
                                 <li><strong>Gerar um "Signed Bundle" ou APK:</strong> No menu superior, vá em <strong>Build > Generate Signed Bundle / APK...</strong>.</li>
                                 <li>
                                     <strong>Escolher o Formato:</strong><br/>
                                     Uma janela irá aparecer. Selecione <strong>Android App Bundle (AAB)</strong> se você for enviar para a Google Play Store. Selecione <strong>APK</strong> se quiser um arquivo para instalar e testar diretamente. Clique em <strong>Next</strong>.
                                 </li>
                                 <li>
                                     <strong>Criar ou Usar uma "Keystore":</strong><br/>
                                     A "keystore" é um arquivo que contém sua assinatura digital. É o que prova para a Google que o app é seu.<br/>
                                     - <strong>Se for a primeira vez:</strong> Clique em <strong>Create new...</strong> e preencha o formulário com senhas e informações seguras. <strong>NÃO PERCA ESTE ARQUIVO NEM A SENHA!</strong><br/>
                                     - <strong>Se você já tem uma:</strong> Selecione <strong>Choose existing...</strong> e localize o arquivo no seu computador, inserindo as senhas.
                                 </li>
                                  <li>
                                     <strong>Selecionar as "Build Variants":</strong><br/>
                                     Na próxima tela, você escolherá a versão do seu app. Marque a opção <strong>release</strong> e clique em <strong>Finish</strong>.
                                 </li>
                                  <li>
                                     <strong>Encontrar os Arquivos Gerados:</strong><br/>
                                     O Android Studio começará a construir seu app. Quando terminar, uma notificação aparecerá no canto inferior direito. O arquivo **AAB** estará em `android/app/build/outputs/bundle/release/app-release.aab` e o **APK** em `android/app/build/outputs/apk/release/app-release.apk`.
                                 </li>
                             </ol>
                             <p className="pt-2">Pronto! Agora você tem os arquivos necessários para testar em um dispositivo físico ou para iniciar o processo de publicação na Google Play Store.</p>
                        </div>
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
