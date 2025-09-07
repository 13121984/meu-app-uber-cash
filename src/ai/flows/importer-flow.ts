
'use server';
/**
 * @fileOverview An intelligent CSV importer flow.
 *
 * - intelligentImporterFlow - A Genkit flow that processes a flexible-format CSV and transforms it into the application's standard import format.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the input schema for the flow, which is the raw CSV content.
const IntelligentImporterInputSchema = z.object({
  csvContent: z.string().describe("The raw content of the user's uploaded CSV file."),
});
export type IntelligentImporterInput = z.infer<typeof IntelligentImporterInputSchema>;

// Define the output schema, which will be the cleaned and transformed CSV content.
const IntelligentImporterOutputSchema = z.object({
  processedCsv: z.string().describe("The processed CSV content, formatted to match the application's required import structure."),
});
export type IntelligentImporterOutput = z.infer<typeof IntelligentImporterOutputSchema>;

/**
 * A server action to securely call the Genkit flow for intelligent CSV processing.
 * This will be called from the client-side component.
 */
export async function runIntelligentImportAction(input: IntelligentImporterInput): Promise<IntelligentImporterOutput> {
  return await intelligentImporterFlow(input);
}


// Define the prompt for the AI model.
const intelligentImportPrompt = ai.definePrompt({
    name: 'intelligentImportPrompt',
    input: { schema: IntelligentImporterInputSchema },
    output: { schema: IntelligentImporterOutputSchema },
    prompt: `Você é um especialista em processamento de dados e sua tarefa é transformar um CSV de um formato "largo" para um formato "longo", seguindo regras específicas.

**Formato do CSV de Entrada (exemplo):**
O CSV de entrada tem uma linha por data. As colunas de ganhos e gastos são separadas por categoria. Por exemplo:
- **Ganhos:** Colunas como "99 Pop", "Ubex", "Particular", cada uma seguida por uma coluna "Viagens".
- **Gastos:** Colunas como "GNV", "Etanol", cada uma com uma coluna de preço ao lado ("Valor por M3" ou "valor por litro").
- **Outros Dados:** Colunas "Kms Percorridos" e "Horas Trabalhadas".

**Formato do CSV de Saída (REQUERIDO):**
O resultado final DEVE SER um CSV com os seguintes cabeçalhos, nesta ordem exata:
\`date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount\`

**Regras de Transformação:**
1.  **Estrutura "Longa":** Para cada linha do CSV de entrada, você criará múltiplas linhas no CSV de saída. Uma linha para cada registro de ganho e uma para cada registro de abastecimento.
2.  **Agrupamento por Data:** As colunas \`date\`, \`km\`, e \`hours\` só devem aparecer na primeira linha de um determinado dia. As linhas subsequentes para o mesmo dia devem ter essas colunas em branco.
3.  **Processamento de Ganhos:** Para cada coluna de ganho (ex: "99 Pop", "Ubex") que tiver um valor, crie uma nova linha:
    *   \`earnings_category\`: O nome da categoria (ex: "99 Pop").
    *   \`earnings_trips\`: O valor da coluna "Viagens" adjacente. Se não houver, use \`0\`.
    *   \`earnings_amount\`: O valor do ganho.
4.  **Processamento de Combustível:** Para cada coluna de combustível (ex: "GNV", "Etanol") que tiver um valor, crie uma nova linha:
    *   \`fuel_type\`: O nome do combustível (ex: "GNV").
    *   \`fuel_paid\`: O valor total pago pelo abastecimento.
    *   \`fuel_price\`: O preço por litro/m³, encontrado na coluna adjacente.
5.  **Conversão de Dados:**
    *   **Data:** Converta de \`DD/MM/YY\` para \`YYYY-MM-DD\`.
    *   **Horas:** Converta o formato \`HH:MM:SS\` ou \`HH:MM\` para um número decimal (ex: \`4:30:00\` se torna \`4.5\`).
    *   **Valores Numéricos:** Remova símbolos de moeda e use ponto (\`.\`) como separador decimal.
6.  **Colunas de Manutenção:** As colunas \`maintenance_description\` e \`maintenance_amount\` devem ser deixadas em branco, pois não existem no CSV de entrada.

**Exemplo de Transformação:**
Se a entrada for:
\`Data,99 Pop,Viagens,Etanol,valor por litro,Kms Percorridos,Horas Trabalhadas\`
\`01/01/25,111.51,12,50,5.09,72.2,4:30:00\`

A saída deve ser:
\`date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount\`
\`2025-01-01,72.2,4.5,99 Pop,12,111.51,,,,,,\`
\`"""""",,Etanol,50,5.09,,,\`

Agora, processe o seguinte CSV e gere a saída formatada:

\`\`\`csv
{{{csvContent}}}
\`\`\`
`,
});


// Define the Genkit flow.
export const intelligentImporterFlow = ai.defineFlow(
  {
    name: 'intelligentImporterFlow',
    inputSchema: IntelligentImporterInputSchema,
    outputSchema: IntelligentImporterOutputSchema,
  },
  async (input) => {
    // Call the AI model with the defined prompt and the input CSV content.
    const { output } = await intelligentImportPrompt(input);
    
    // The output will be automatically validated against the IntelligentImporterOutputSchema.
    // We can be confident that output.processedCsv is a string.
    return output!;
  }
);
