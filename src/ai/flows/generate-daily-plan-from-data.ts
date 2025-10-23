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
import {Task} from '@/lib/types';

const GenerateDailyPlanFromDataInputSchema = z.object({
  data: z
    .string()
    .describe(
      'The data to analyze, which can be a combination of text from files, image descriptions, and transcriptions of voice recordings.'
    ),
});
export type GenerateDailyPlanFromDataInput = z.infer<typeof GenerateDailyPlanFromDataInputSchema>;

const GenerateDailyPlanFromDataOutputSchema = z.object({
  tasks: z.array(z.object({
      id: z.string().describe('A unique identifier for the task.'),
      text: z.string().describe('The description of the task.'),
      completed: z.boolean().describe('Whether the task is completed.'),
    }))
    .describe('A list of tasks for the daily plan.'),
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
  For each task, provide a unique ID, the task description, and set completed to false.

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
    if (!output) {
      return {tasks: []};
    }
    // Ensure each task has a unique ID.
    return {
      tasks: output.tasks.map((task, index) => ({...task, id: `${Date.now()}-${index}`}))
    };
  }
);
