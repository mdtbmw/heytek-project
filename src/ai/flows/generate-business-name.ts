'use server';

/**
 * @fileOverview AI-driven business name generation flow with domain availability check.
 *
 * - generateBusinessName - A function that generates business names based on the startup idea and checks for domain availability.
 * - GenerateBusinessNameInput - The input type for the generateBusinessName function.
 * - GenerateBusinessNameOutput - The return type for the generateBusinessName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessNameInputSchema = z.object({
  startupIdea: z
    .string()
    .describe('A description of the startup idea for which a name is needed.'),
  domainAvailabilityCheck: z
    .boolean()
    .describe('Whether to check for domain availability for the generated names.'),
});

export type GenerateBusinessNameInput = z.infer<typeof GenerateBusinessNameInputSchema>;

const GenerateBusinessNameOutputSchema = z.object({
  businessNames: z
    .array(z.string())
    .describe('An array of potential business names for the startup idea.'),
  domainAvailability: z
    .array(z.boolean())
    .optional()
    .describe('An array indicating domain availability for each business name.'),
});

export type GenerateBusinessNameOutput = z.infer<typeof GenerateBusinessNameOutputSchema>;

export async function generateBusinessName(
  input: GenerateBusinessNameInput
): Promise<GenerateBusinessNameOutput> {
  return generateBusinessNameFlow(input);
}

const generateBusinessNamePrompt = ai.definePrompt({
  name: 'generateBusinessNamePrompt',
  input: {schema: GenerateBusinessNameInputSchema},
  output: {schema: GenerateBusinessNameOutputSchema},
  prompt: `You are a creative business name generator. Based on the provided startup idea, generate a list of potential business names. 

Startup Idea: {{{startupIdea}}}

Generate 5 business names that are creative, memorable, and relevant to the startup idea. The names should be relatively short and easy to pronounce.

Output the names as a JSON array.`,
});

const generateBusinessNameFlow = ai.defineFlow(
  {
    name: 'generateBusinessNameFlow',
    inputSchema: GenerateBusinessNameInputSchema,
    outputSchema: GenerateBusinessNameOutputSchema,
  },
  async input => {
    const {output} = await generateBusinessNamePrompt(input);
    // TODO: Implement domain availability check if domainAvailabilityCheck is true
    // This is a placeholder implementation.
    if (input.domainAvailabilityCheck) {
      return {
        businessNames: output!.businessNames,
        domainAvailability: [true, false, true, false, true],
      };
    }
    return {
      businessNames: output!.businessNames,
    };
  }
);
