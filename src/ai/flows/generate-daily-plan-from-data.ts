'use server';

/**
 * @fileOverview Generates a personalized daily plan with actionable to-do items after analyzing user-provided data (files, images, voice recordings).
 *
 * - generateDailyPlanFromData - A function that generates a daily plan from data.
 * - GenerateDailyPlanFromDataInput - The input type for the generateDailyPlanFromData function.
 * - GenerateDailyPlanFromDataOutput - The return type for the generateDailyPlanFromData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyPlanFromDataInputSchema = z.object({
  data: z
    .string()
    .describe(
      'The data to analyze, which can be a combination of text from files, image descriptions, and transcriptions of voice recordings.'
    ),
});
export type GenerateDailyPlanFromDataInput = z.infer<typeof GenerateDailyPlanFromDataInputSchema>;

const GenerateDailyPlanFromDataOutputSchema = z.object({
  dailyPlan: z
    .string()
    .describe('A personalized daily plan with actionable to-do items.'),
});
export type GenerateDailyPlanFromDataOutput = z.infer<typeof GenerateDailyPlanFromDataOutputSchema>;

export async function generateDailyPlanFromData(
  input: GenerateDailyPlanFromDataInput
): Promise<GenerateDailyPlanFromDataOutput> {
  return generateDailyPlanFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyPlanFromDataPrompt',
  input: {schema: GenerateDailyPlanFromDataInputSchema},
  output: {schema: GenerateDailyPlanFromDataOutputSchema},
  prompt: `You are an AI assistant designed to create personalized daily plans.

  Analyze the following data provided by the user and generate a step-by-step to-do list for the day.
  The daily plan should be actionable and specific. Focus on extracting key information and converting it into tasks.

  Data: {{{data}}} `,
});

const generateDailyPlanFromDataFlow = ai.defineFlow(
  {
    name: 'generateDailyPlanFromDataFlow',
    inputSchema: GenerateDailyPlanFromDataInputSchema,
    outputSchema: GenerateDailyPlanFromDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
