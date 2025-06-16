
'use server';
/**
 * @fileOverview A Genkit flow for generating a pitch deck outline for founders.
 *
 * - generatePitchDeckOutline - A function that takes startup details and generates a pitch deck outline.
 * - GeneratePitchDeckOutlineInput - The input type for the generatePitchDeckOutline function.
 * - GeneratePitchDeckOutlineOutput - The return type for the generatePitchDeckOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePitchDeckOutlineInputSchema = z.object({
  startupIdea: z.string().describe('The core summary of the startup idea.'),
  problem: z.string().describe('The problem the startup is solving.'),
  solution: z.string().describe('The proposed solution.'),
  targetAudience: z.string().describe('The primary target audience.'),
  businessModel: z.string().optional().describe('How the startup plans to make money.'),
  teamOverview: z.string().optional().describe('A brief overview of the core team and their strengths.'),
});
export type GeneratePitchDeckOutlineInput = z.infer<typeof GeneratePitchDeckOutlineInputSchema>;

const SlideSchema = z.object({
  title: z.string().describe('The title of the pitch deck slide.'),
  keyPoints: z.array(z.string()).describe('Key bullet points or topics to cover in this slide.'),
});

const GeneratePitchDeckOutlineOutputSchema = z.object({
  deckTitleSuggestion: z.string().describe('A suggested overall title for the pitch deck.'),
  slides: z.array(SlideSchema).describe('An array of slides, each with a title and key points.'),
  additionalTips: z.array(z.string()).optional().describe('Any additional tips for creating the pitch deck.'),
});
export type GeneratePitchDeckOutlineOutput = z.infer<typeof GeneratePitchDeckOutlineOutputSchema>;

export async function generatePitchDeckOutline(input: GeneratePitchDeckOutlineInput): Promise<GeneratePitchDeckOutlineOutput> {
  return generatePitchDeckOutlineFlow(input);
}

const generatePitchDeckOutlinePrompt = ai.definePrompt({
  name: 'generatePitchDeckOutlinePrompt',
  input: {schema: GeneratePitchDeckOutlineInputSchema},
  output: {schema: GeneratePitchDeckOutlineOutputSchema},
  prompt: `You are an expert startup advisor specializing in creating compelling pitch decks.
  A founder needs an outline for their pitch deck based on the following details:
  Startup Idea: {{{startupIdea}}}
  Problem: {{{problem}}}
  Solution: {{{solution}}}
  Target Audience: {{{targetAudience}}}
  {{#if businessModel}}Business Model: {{{businessModel}}}{{/if}}
  {{#if teamOverview}}Team Overview: {{{teamOverview}}}{{/if}}

  Please generate a pitch deck outline consisting of approximately 7-10 key slides.
  For each slide, provide a clear title and 3-5 bullet points covering the essential information for that slide.
  The typical slides include:
  1. Cover/Intro (Company Name, Tagline)
  2. Problem (The pain point you're addressing)
  3. Solution (Your innovative approach)
  4. Product/Service (How it works, key features, demo if possible)
  5. Market Size (TAM, SAM, SOM - illustrate the opportunity)
  6. Business Model (How you make money)
  7. Traction/Progress (Milestones achieved, users, revenue if any)
  8. Team (Key members and their relevance)
  9. The Ask (Funding amount and use of funds, if applicable)
  10. Contact/Thank You

  Suggest a compelling 'deckTitleSuggestion'.
  Optionally, provide 1-2 'additionalTips' for the founder.
  Ensure the output is structured according to the GeneratePitchDeckOutlineOutputSchema.
  Focus on clarity and impact for each slide's key points.
  `,
});

const generatePitchDeckOutlineFlow = ai.defineFlow(
  {
    name: 'generatePitchDeckOutlineFlow',
    inputSchema: GeneratePitchDeckOutlineInputSchema,
    outputSchema: GeneratePitchDeckOutlineOutputSchema,
  },
  async (input) => {
    const {output} = await generatePitchDeckOutlinePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate pitch deck outline.');
    }
    return output;
  }
);
    