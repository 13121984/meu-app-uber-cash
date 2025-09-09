
'use server';

import { analyzeRace, AnalyzeRaceInput, AnalyzeRaceOutput } from '@/ai/flows/analise-corrida-flow';
import { z } from 'zod';

const ActionInputSchema = z.object({
  image: z.string(),
  rates: z.object({
    ratePerKm: z.number(),
    ratePerHour: z.number(),
  }),
});
type ActionInput = z.infer<typeof ActionInputSchema>;

export type AnalysisOutput = AnalyzeRaceOutput;
export type AnalysisInput = AnalyzeRaceInput;

export async function runAnalysisAction(input: ActionInput): Promise<{ success: boolean; output?: AnalysisOutput, error?: string; }> {
  try {
    const validatedInput = ActionInputSchema.parse(input);
    const flowInput: AnalyzeRaceInput = {
      raceImage: validatedInput.image,
      userRates: validatedInput.rates,
    };
    
    const result = await analyzeRace(flowInput);
    return { success: true, output: result };

  } catch (error) {
    console.error("Error in runAnalysisAction:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido durante a análise.";
    return { success: false, error: errorMessage };
  }
}
