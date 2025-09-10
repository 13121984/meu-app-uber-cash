
'use server';
/**
 * @fileOverview Um fluxo de IA para fornecer suporte ao cliente. (PLACEHOLDER)
 *
 * - getSupportResponse - Analisa a pergunta do usuário e tenta respondê-la.
 * - GetSupportInput - O tipo de entrada para a função de suporte.
 * - GetSupportOutput - O tipo de retorno para a função de suporte.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// TODO: Construir a base de conhecimento com os dados da Central de Ajuda.
const KNOWLEDGE_BASE = `
- O plano Básico é gratuito e oferece registros manuais.
- O plano Pro adiciona análise de corridas por IA e mais personalização.
- O plano Autopilot oferece captura 100% automática das corridas.
- Para registrar, vá em "Registrar Hoje" ou "Outro Dia".
- Para editar, vá em "Gerenciamento".
- O Taxímetro Inteligente é para corridas particulares.
`;

export const GetSupportInputSchema = z.object({
  userQuestion: z.string().describe('A pergunta ou problema do usuário.'),
  chatHistory: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).optional().describe('O histórico da conversa até o momento.'),
});
export type GetSupportInput = z.infer<typeof GetSupportInputSchema>;


export const GetSupportOutputSchema = z.object({
  answer: z.string().describe('A resposta para a pergunta do usuário.'),
  canResolve: z.boolean().describe('Se a IA acredita que pode resolver o problema com a informação que tem. Se for `false`, o app deve sugerir abrir um ticket.'),
});
export type GetSupportOutput = z.infer<typeof GetSupportOutputSchema>;

const supportPrompt = ai.definePrompt({
    name: 'supportPrompt',
    input: { schema: GetSupportInputSchema },
    output: { schema: GetSupportOutputSchema },
    prompt: `Você é um agente de suporte amigável e eficiente para o aplicativo Uber Cash. Sua tarefa é responder às perguntas dos usuários com base na base de conhecimento fornecida.

Base de Conhecimento:
${KNOWLEDGE_BASE}

Histórico da Conversa:
{{#each chatHistory}}
- {{role}}: {{content}}
{{/each}}

Pergunta do Usuário:
{{userQuestion}}

Instruções:
1.  Leia a pergunta do usuário.
2.  Consulte a Base de Conhecimento para encontrar a resposta.
3.  Se você encontrar uma resposta clara, formule-a de maneira amigável e defina "canResolve" como \`true\`.
4.  Se a pergunta for muito complexa, não estiver na base de conhecimento, ou for um pedido de reembolso ou problema técnico específico, peça desculpas, explique que não pode resolver pelo chat e sugira que o usuário abra um ticket. Defina "canResolve" como \`false\`.
5.  Responda sempre em português do Brasil.`,
});

// Define o fluxo principal que executa o prompt (atualmente como placeholder)
const getSupportResponseFlow = ai.defineFlow(
  {
    name: 'getSupportResponseFlow',
    inputSchema: GetSupportInputSchema,
    outputSchema: GetSupportOutputSchema,
  },
  async (input) => {
    // ESTA É UMA IMPLEMENTAÇÃO DE PLACEHOLDER
    // A implementação real chamaria o `supportPrompt`
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula a chamada de IA

    if (input.userQuestion.toLowerCase().includes("afiliado")) {
        return {
            answer: "Que legal seu interesse! Nosso programa de afiliados ainda está em desenvolvimento. Para entrar na lista de espera e ser um dos primeiros a saber, por favor, envie um e-mail para nossa equipe através do formulário de ticket.",
            canResolve: true
        }
    }
    
    return {
      answer: "Olá! No momento, nosso chat com IA está em desenvolvimento. Para obter ajuda, por favor, consulte nossa Central de Ajuda ou abra um ticket por e-mail e nossa equipe responderá o mais breve possível.",
      canResolve: false,
    };
  }
);


export async function getSupportResponse(input: GetSupportInput): Promise<GetSupportOutput> {
  return await getSupportResponseFlow(input);
}
