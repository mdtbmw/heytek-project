
// use server'
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating brand elements such as taglines, vision statements, mission statements, short brand descriptions, an ASCII logo, and color palette ideas based on a startup idea.
 *
 * - generateBrandElements - A function that takes a startup idea and generates brand elements.
 * - GenerateBrandElementsInput - The input type for the generateBrandElements function.
 * - GenerateBrandElementsOutput - The return type for the generateBrandElements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandElementsInputSchema = z.object({
  startupIdea: z
    .string()
    .describe('The startup idea that brand elements will be generated for.'),
  businessName: z.string().optional().describe('The chosen business name, if available.'),
});
export type GenerateBrandElementsInput = z.infer<typeof GenerateBrandElementsInputSchema>;

const GenerateBrandElementsOutputSchema = z.object({
  taglines: z.array(z.string()).describe('Catchy taglines for the startup.'),
  visionStatement: z.string().describe('The vision statement for the startup.'),
  missionStatement: z.string().describe('The mission statement for the startup.'),
  brandDescription: z.string().describe('A short brand description for the startup.'),
  asciiLogo: z.string().optional().describe('A simple ASCII or emoji-based logo sketch relevant to the business name or idea.'),
  colorPaletteSuggestion: z.string().optional().describe('A textual description of a suggested color palette and the rationale behind it (e.g., "A vibrant orange to signify energy, paired with a deep blue for trust and stability. Good for a tech startup.")'),
});
export type GenerateBrandElementsOutput = z.infer<typeof GenerateBrandElementsOutputSchema>;

export async function generateBrandElements(input: GenerateBrandElementsInput): Promise<GenerateBrandElementsOutput> {
  return generateBrandElementsFlow(input);
}

const generateBrandElementsPrompt = ai.definePrompt({
  name: 'generateBrandElementsPrompt',
  input: {schema: GenerateBrandElementsInputSchema},
  output: {schema: GenerateBrandElementsOutputSchema},
  prompt: `You are a creative branding expert and a bit of a fun-loving artist. 
  For the startup idea: "{{{startupIdea}}}" 
  {{#if businessName}}and the business name: "{{{businessName}}}"{{/if}}, 
  
  Please generate the following:
  1.  Taglines (3 distinct options, catchy and short).
  2.  Vision Statement (aspirational, future-focused).
  3.  Mission Statement (action-oriented, purpose-driven).
  4.  Brand Description (a concise paragraph capturing the essence of the brand).
  5.  ASCII Logo (a very simple, creative logo sketch using ASCII characters or emojis that relates to the business name or idea. Keep it small, max 5 lines, 20 chars wide).
  6.  Color Palette Suggestion (describe 2-3 colors, their meaning/vibe, and why they fit this brand. E.g., "Consider a deep teal for sophistication and a bright yellow for optimism. This combination evokes innovation and approachability.").

  Be creative and ensure the elements are aligned with the startup idea and name (if provided). 
  Make the ASCII logo fun and recognizable if possible! For the color palette, explain your choices briefly.
  Ensure all fields in the output schema are populated, even if with a default like "Could not generate at this time." if really stuck.
  `,
});

const generateBrandElementsFlow = ai.defineFlow(
  {
    name: 'generateBrandElementsFlow',
    inputSchema: GenerateBrandElementsInputSchema,
    outputSchema: GenerateBrandElementsOutputSchema,
  },
  async input => {
    const {output} = await generateBrandElementsPrompt(input);
    return {
        taglines: output?.taglines || ["Tagline generation is tough, let's try again!"],
        visionStatement: output?.visionStatement || "A grand vision is forming... let's refine it!",
        missionStatement: output?.missionStatement || "Our mission, should we choose to accept it... needs a bit more thought!",
        brandDescription: output?.brandDescription || "Describing this brand... is a work in progress!",
        asciiLogo: output?.asciiLogo || ":( no logo idea yet",
        colorPaletteSuggestion: output?.colorPaletteSuggestion || "Colors are hard! Maybe something bright?",
    };
  }
);

    