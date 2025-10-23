'use server';
/**
 * @fileOverview This file contains a Genkit flow that analyzes user inputs, especially voice recordings,
 * and organizes them into categories with tags for easy retrieval.
 *
 * - organizeDataWithAI - The main function to trigger the data organization flow.
 * - OrganizeDataWithAIInput - The input type for the organizeDataWithAI function.
 * - OrganizeDataWithAIOutput - The return type for the organizeDataWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrganizeDataWithAIInputSchema = z.object({
  inputData: z.string().describe('The data to be organized, can be text, file data URI, or voice recording data URI.'),
});
export type OrganizeDataWithAIInput = z.infer<typeof OrganizeDataWithAIInputSchema>;

const OrganizeDataWithAIOutputSchema = z.object({
  category: z.string().describe('The category of the input data.'),
  tags: z.array(z.string()).describe('Tags associated with the input data.'),
  summary: z.string().describe('A short summary of the input data.'),
});
export type OrganizeDataWithAIOutput = z.infer<typeof OrganizeDataWithAIOutputSchema>;

export async function organizeDataWithAI(input: OrganizeDataWithAIInput): Promise<OrganizeDataWithAIOutput> {
  return organizeDataWithAIFlow(input);
}

const organizeDataWithAIPrompt = ai.definePrompt({
  name: 'organizeDataWithAIPrompt',
  input: {schema: OrganizeDataWithAIInputSchema},
  output: {schema: OrganizeDataWithAIOutputSchema},
  prompt: `You are an AI assistant that analyzes user input and organizes it into categories with tags.

Analyze the following input data and determine its category, relevant tags, and a short summary.

Input Data: {{{inputData}}}

Category: 
Tags: 
Summary: `,
});

const organizeDataWithAIFlow = ai.defineFlow(
  {
    name: 'organizeDataWithAIFlow',
    inputSchema: OrganizeDataWithAIInputSchema,
    outputSchema: OrganizeDataWithAIOutputSchema,
  },
  async input => {
    const {output} = await organizeDataWithAIPrompt(input);
    return output!;
  }
);
