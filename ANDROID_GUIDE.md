# Guia de Desenvolvimento Nativo para o Rota Certa

Olá! Este é o seu guia pessoal para os próximos passos no desenvolvimento Android do Rota Certa. Use este documento como um roteiro e um "bloco de notas" para as funcionalidades avançadas que planejamos.

---

## Parte 1: Implementando o Capturador de Corridas (Leitura de Tela)

Esta é a funcionalidade mais avançada que planejamos. Ela envolve a criação de código nativo no Android Studio para ler a tela de outros aplicativos, exibir um widget flutuante e salvar os dados.

### Conceito Geral

O sistema funcionará com um **"Serviço"** que roda em segundo plano no Android. Ele vai:

1.  **Detectar a Corrida:** Usar um **Serviço de Acessibilidade** para "ler" o texto na tela quando os apps da Uber ou 99 estiverem abertos.
2.  **Tirar uma Foto:** Usar a **API MediaProjection** para capturar uma imagem da tela da corrida.
3.  **Analisar e Exibir:** Mostrar um **Widget Flutuante (Overlay)** com os dados da corrida e a análise de ganhos.
4.  **Salvar no App:** Enviar os dados da corrida (valor, distância, etc.) de volta para o Rota Certa para salvar no histórico.

### Passo a Passo para o Desenvolvedor

#### Passo 1: Abrir o Projeto no Android Studio
- Dentro da pasta do seu projeto, localize a subpasta `android`.
- Abra esta pasta `android` como um projeto no Android Studio.

#### Passo 2: Adicionar as Permissões no `AndroidManifest.xml`
- Localize o arquivo em: `android/app/src/main/AndroidManifest.xml`.
- Adicione as seguintes permissões dentro da tag `<manifest>`:

```xml
<!-- Permissão para desenhar sobre outros apps (o widget flutuante) -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

<!-- Permissão para rodar o serviço em segundo plano -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- Permissão para o serviço de acessibilidade (será configurado em um arquivo separado) -->
<!-- Não é uma "uses-permission", mas sim a declaração do serviço -->
```

#### Passo 3: Criar o Serviço de Acessibilidade
- Este é o "cérebro" da operação. Será uma nova classe (ex: `RideCaptureService.java` ou `.kt`).
- **O que ele faz:**
    - É configurado para observar eventos nos apps da Uber (`com.ubercab.driver`) e 99 (`com.taxis99`).
    - Quando uma nova janela ou texto aparece nesses apps, o Android notifica este serviço.
    - O código dentro do serviço irá percorrer os elementos da tela para extrair textos como "Nova Viagem", valor, distância e tempo.
- **Como registrar:** Você precisará declarar este serviço no `AndroidManifest.xml` e criar um arquivo de configuração XML em `res/xml/` para especificar quais apps ele deve observar.

#### Passo 4: Criar o Serviço em Primeiro Plano (Foreground Service)
- Este é o "coração" que mantém o app vivo.
- **O que ele faz:**
    - Garante que o Android não feche seu app enquanto ele está em segundo plano.
    - Exibe uma notificação persistente para o usuário (ex: "Rota Certa está protegendo suas corridas").
- **Como funciona:** Este serviço é iniciado quando o usuário ativa a funcionalidade de captura e é ele quem vai gerenciar o widget flutuante.

#### Passo 5: Implementar o Widget Flutuante e a Captura de Tela
- Quando o Serviço de Acessibilidade detecta uma nova corrida, ele se comunica com o Serviço em Primeiro Plano.
- O Serviço em Primeiro Plano, então:
    1.  Usa a API `MediaProjection` para solicitar permissão e capturar a tela.
    2.  Usa o `WindowManager` do Android para adicionar uma nova "view" (o widget flutuante) na tela.
    3.  Salva a imagem capturada e os dados da corrida.

#### Passo 6: Comunicar com a Interface Web (Capacitor)
- Esta é a ponte de volta para o seu app. Você precisará criar um **Plugin do Capacitor customizado**.
1.  **Criar o Plugin:** Siga a documentação do Capacitor para criar um novo plugin (ex: `RideCapturePlugin`).
2.  **Definir um Evento:** O plugin terá um método para notificar a parte web. Por exemplo, você pode criar um evento chamado `rideCaptured`.
3.  **Enviar os Dados:** A parte nativa (seu serviço Android) chamará este plugin e passará os dados da corrida (JSON com valor, distância, etc.) e a imagem (como uma string base64).
4.  **Receber os Dados no App:** Na sua página `/historico-chamadas`, você usará a biblioteca do Capacitor para "ouvir" o evento `rideCaptured`. Quando o evento for recebido, você atualizará a tela com os novos dados.

---

## Parte 2: Gerando os Arquivos para Publicação (APK e AAB)

Depois que seu aplicativo estiver pronto, você precisará gerar os arquivos para testar e para publicar na Google Play Store.

### O que é APK e AAB?
- **APK (`Android Package Kit`):** É o arquivo que você pode instalar diretamente no seu celular para testar.
- **AAB (`Android App Bundle`):** É o formato que você envia para a Google Play Store. A loja usa o AAB para gerar APKs otimizados para cada tipo de celular.

### Passo a Passo no Android Studio

1.  **Sincronizar o Projeto Web:**
    - Antes de qualquer coisa, rode este comando no terminal, na pasta raiz do seu projeto:
      ```bash
      npx cap sync android
      ```
    - Isso garante que a versão mais recente do seu código Next.js seja copiada para o projeto Android.

2.  **Abrir o Android Studio:**
    - Abra a pasta `android` no Android Studio.

3.  **Gerar um "Signed Bundle" ou APK:**
    - No menu superior, vá em **Build > Generate Signed Bundle / APK...**.

4.  **Escolher o Formato:**
    - Uma janela irá aparecer. Selecione **Android App Bundle (AAB)** se você for enviar para a Google Play Store.
    - Selecione **APK** se quiser um arquivo para instalar e testar diretamente.
    - Clique em **Next**.

5.  **Criar ou Usar uma "Keystore":**
    - A "keystore" é um arquivo que contém sua assinatura digital. É o que prova para a Google que o app é seu.
    - **Se for a primeira vez:**
        - Clique em **Create new...**.
        - Preencha o formulário:
            - **Key store path:** Escolha um local seguro no seu computador para salvar este arquivo. **NÃO PERCA ESTE ARQUIVO NEM A SENHA!**
            - **Password:** Crie uma senha forte para a keystore.
            - **Alias:** Dê um nome para a sua chave (ex: `rotacerta-key`).
            - **Password (Key):** Crie uma senha forte para a chave (pode ser a mesma da keystore).
            - **Validity:** Deixe o padrão (25 anos).
            - **Certificate:** Preencha com suas informações.
        - Clique em **OK**.
    - **Se você já tem uma keystore:**
        - Selecione **Choose existing...** e localize o arquivo no seu computador.
        - Insira as senhas da keystore e da chave.

6.  **Selecionar as "Build Variants":**
    - Na próxima tela, você escolherá a versão do seu app. Marque a opção **release**.
    - Clique em **Finish**.

7.  **Encontrar os Arquivos Gerados:**
    - O Android Studio começará a construir seu app. Isso pode levar alguns minutos.
    - Quando terminar, uma notificação aparecerá no canto inferior direito da tela.
    - O arquivo **AAB** estará em: `android/app/build/outputs/bundle/release/app-release.aab`.
    - O arquivo **APK** estará em: `android/app/build/outputs/apk/release/app-release.apk`.

Pronto! Agora você tem os arquivos necessários para testar em um dispositivo físico ou para iniciar o processo de publicação na Google Play Store.
