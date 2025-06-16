
'use server';
/**
 * @fileOverview A Genkit flow for generating brand voice archetypes for Brand Consultants.
 *
 * - generateBrandVoice - A function that takes company details and suggests brand voice archetypes.
 * - GenerateBrandVoiceInput - The input type for the generateBrandVoice function.
 * - GenerateBrandVoiceOutput - The return type for the generateBrandVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandVoiceInputSchema = z.object({
  companyName: z.string().describe("The name of the client's company."),
  industry: z.string().describe("The industry the company operates in."),
  coreIdeaOrMission: z.string().describe("The company's core idea, mission, or unique selling proposition."),
  targetAudienceDescription: z.string().optional().describe("A brief description of the company's target audience."),
});
export type GenerateBrandVoiceInput = z.infer<typeof GenerateBrandVoiceInputSchema>;

const VoiceArchetypeSchema = z.object({
  archetypeName: z.string().describe('The name of the brand voice archetype (e.g., "The Sage," "The Jester," "The Hero").'),
  description: z.string().describe('A brief description of this voice archetype and its characteristics.'),
  keywords: z.array(z.string()).describe('3-5 keywords associated with this voice.'),
  exampleSentence: z.string().describe('An example sentence written in this brand voice, relevant to the company.'),
});

const GenerateBrandVoiceOutputSchema = z.object({
  suggestedArchetypes: z.array(VoiceArchetypeSchema).min(2).max(3).describe('An array of 2-3 suggested brand voice archetypes.'),
  rationale: z.string().optional().describe("A brief rationale for why these archetypes might suit the company."),
});
export type GenerateBrandVoiceOutput = z.infer<typeof GenerateBrandVoiceOutputSchema>;

export async function generateBrandVoice(input: GenerateBrandVoiceInput): Promise<GenerateBrandVoiceOutput> {
  return generateBrandVoiceFlow(input);
}

const generateBrandVoicePrompt = ai.definePrompt({
  name: 'generateBrandVoicePrompt',
  input: {schema: GenerateBrandVoiceInputSchema},
  output: {schema: GenerateBrandVoiceOutputSchema},
  prompt: `You are a senior brand strategist advising a Brand Consultant on HeyTek.
  The consultant needs help defining potential brand voice archetypes for their client.
  Client Company Details:
  Company Name: {{{companyName}}}
  Industry: {{{industry}}}
  Core Idea/Mission: {{{coreIdeaOrMission}}}
  {{#if targetAudienceDescription}}Target Audience: {{{targetAudienceDescription}}}{{/if}}

  Please generate 2-3 distinct 'suggestedArchetypes'. For each archetype:
  - Provide an 'archetypeName' (e.g., "The Innovator," "The Nurturer," "The Maverick").
  - Write a short 'description' of its characteristics.
  - List 3-5 relevant 'keywords'.
  - Craft an 'exampleSentence' in this voice that could be used by the client's company.

  Optionally, provide a brief overall 'rationale' for your suggestions.
  Ensure the output strictly adheres to the GenerateBrandVoiceOutputSchema.
  The goal is to provide actionable and creative starting points for the consultant and their client.
  `,
});

const generateBrandVoiceFlow = ai.defineFlow(
  {
    name: 'generateBrandVoiceFlow',
    inputSchema: GenerateBrandVoiceInputSchema,
    outputSchema: GenerateBrandVoiceOutputSchema,
  },
  async (input) => {
    const {output} = await generateBrandVoicePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate brand voice suggestions.');
    }
    return output;
  }
);
    