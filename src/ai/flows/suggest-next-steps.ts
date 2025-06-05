// src/ai/flows/suggest-next-steps.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting actionable next steps based on medical image analysis.
 *
 * - suggestNextSteps - A function that takes medical image analysis and findings as input and returns suggested next steps.
 * - SuggestNextStepsInput - The input type for the suggestNextSteps function.
 * - SuggestNextStepsOutput - The return type for the suggestNextSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextStepsInputSchema = z.object({
  imageAnalysis: z
    .string()
    .describe('The analysis of the medical image, including detected abnormalities and anatomical features.'),
  findings: z.string().describe('The findings from the image analysis.'),
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

const SuggestNextStepsOutputSchema = z.object({
  nextSteps: z
    .string()
    .describe('A list of actionable next steps based on the image analysis and findings.'),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
  return suggestNextStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextStepsPrompt',
  input: {schema: SuggestNextStepsInputSchema},
  output: {schema: SuggestNextStepsOutputSchema},
  prompt: `You are an AI assistant that suggests actionable next steps for medical professionals based on medical image analysis and findings.

Given the following image analysis and findings, suggest a list of actionable next steps. Be specific and provide clear instructions.

Image Analysis: {{{imageAnalysis}}}

Findings: {{{findings}}}

Actionable Next Steps:`,
});

const suggestNextStepsFlow = ai.defineFlow(
  {
    name: 'suggestNextStepsFlow',
    inputSchema: SuggestNextStepsInputSchema,
    outputSchema: SuggestNextStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
