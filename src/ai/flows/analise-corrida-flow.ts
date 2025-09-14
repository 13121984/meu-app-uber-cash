
'use server';

/**
 * @fileOverview Um fluxo de IA para analisar capturas de tela de ofertas de corrida.
 *
 * - analyzeRace - Analisa uma imagem de corrida com base nas metas do usuário.
 * - AnalyzeRaceInput - O tipo de entrada para a função analyzeRace.
 * - AnalyzeRaceOutput - O tipo de retorno para a função analyzeRace.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define o schema de entrada para o fluxo de IA
export const AnalyzeRaceInputSchema = z.object({
  raceImage: z
    .string()
    .describe(
      "Uma captura de tela de uma oferta de corrida, como um data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userRates: z.object({
    ratePerKm: z.number().describe('A meta de ganho por quilômetro do usuário (ex: R$/km).'),
    ratePerHour: z.number().describe('A meta de ganho por hora do usuário (ex: R$/hora).'),
  }),
});
export type AnalyzeRaceInput = z.infer<typeof AnalyzeRaceInputSchema>;

// Define o schema de saída que a IA deve retornar
export const AnalyzeRaceOutputSchema = z.object({
  recommendation: z
    .string()
    .describe('A recomendação final. Deve ser "Bora" se a corrida for boa, ou "Tô Fora" se não for.'),
  reasoning: z
    .string()
    .describe('Uma explicação curta e amigável sobre o porquê da recomendação, mencionando os pontos fortes e fracos.'),
  extractedData: z.object({
    estimatedValue: z.number().describe('O valor total estimado da corrida em reais.'),
    distanceKm: z.number().describe('A distância total da corrida em quilômetros.'),
    durationMinutes: z.number().describe('A duração total da corrida em minutos.'),
  }),
  calculatedRates: z.object({
    ratePerKm: z.number().describe('O ganho por KM calculado para esta corrida.'),
    ratePerHour: z.number().describe('O ganho por hora calculado para esta corrida.'),
  }),
});
export type AnalyzeRaceOutput = z.infer<typeof AnalyzeRaceOutputSchema>;

// Define o prompt multimodal para o Gemini
const analyzeRacePrompt = ai.definePrompt({
    name: 'analyzeRacePrompt',
    input: { schema: AnalyzeRaceInputSchema },
    output: { schema: AnalyzeRaceOutputSchema },
    prompt: `Você é um copiloto especialista em analisar ofertas de corridas de aplicativos como Uber e 99. Sua tarefa é extrair os dados de uma imagem e decidir se a corrida é financeiramente vantajosa para o motorista, com base nas metas dele.

1.  **Extraia os seguintes dados da imagem:**
    *   Valor total da corrida.
    *   Distância total da corrida.
    *   Duração total da corrida.
    *   Se algum dado não estiver claro, faça uma estimativa razoável.

2.  **Calcule os ganhos:**
    *   Calcule o ganho por KM (R$/km).
    *   Calcule o ganho por Hora (R$/hora).

3.  **Compare com as metas do motorista:**
    *   Meta de R$/km: {{userRates.ratePerKm}}
    *   Meta de R$/hora: {{userRates.ratePerHour}}

4.  **Dê sua recomendação:**
    *   Se AMBOS os ganhos (R$/km e R$/hora) forem IGUAIS ou MAIORES que as metas, sua recomendação DEVE ser "Bora".
    *   Caso contrário, sua recomendação DEVE ser "Tô Fora".

5.  **Forneça uma justificativa:** Escreva uma análise curta, objetiva e amigável (em português do Brasil) explicando sua decisão. Se for "Bora", elogie os bons números. Se for "Tô Fora", explique qual indicador (ou ambos) ficou abaixo da meta.

**Imagem da Corrida:**
{{media url=raceImage}}

**Instruções de Saída:**
Sua resposta final deve ser um JSON válido que corresponda ao schema de saída definido. Preencha todos os campos, incluindo os dados extraídos, os ganhos calculados, a recomendação e a justificativa.`,
});


// Define o fluxo principal que executa o prompt
const analyzeRaceFlow = ai.defineFlow(
  {
    name: 'analyzeRaceFlow',
    inputSchema: AnalyzeRaceInputSchema,
    outputSchema: AnalyzeRaceOutputSchema,
  },
  async (input) => {
    // Chama o prompt de IA com a entrada
    const { output } = await analyzeRacePrompt(input);
    if (!output) {
      throw new Error("A IA não conseguiu analisar a imagem. Tente novamente com uma imagem mais nítida.");
    }
    return output;
  }
);


/**
 * Função exportada que serve como um wrapper seguro para chamar o fluxo de IA a partir do lado do servidor.
 * @param input Os dados da imagem e as metas do usuário.
 * @returns O resultado da análise da IA.
 */
export async function analyzeRace(input: AnalyzeRaceInput): Promise<AnalyzeRaceOutput> {
  return await analyzeRaceFlow(input);
}
