
'use server';
/**
 * @fileOverview A Genkit flow for generating a concise product profile for pitch decks.
 *
 * - generateProductProfile - A function that takes product details and generates a profile.
 * - GenerateProductProfileInput - The input type for the generateProductProfile function.
 * - GenerateProductProfileOutput - The return type for the generateProductProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateProductProfileInputSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  startupIdeaSummary: z.string().min(10, "Startup idea summary is required (min 10 chars).").describe("Overall summary of the startup idea or business context."),
  coreFeatures: z.string().min(10, "Core features are required (min 10 chars).").describe("Comma-separated list or brief description of 3-5 key product features."),
  targetAudience: z.string().min(5, "Target audience is required.").describe("Specific description of the ideal user or customer segment."),
  problemSolved: z.string().min(10, "Problem solved is required (min 10 chars).").describe("The primary problem or pain point the product addresses."),
  uniqueSellingProposition: z.string().min(10, "Unique selling proposition is required (min 10 chars).").describe("What makes this product different or better than alternatives."),
});
export type GenerateProductProfileInput = z.infer<typeof GenerateProductProfileInputSchema>;

export const GenerateProductProfileOutputSchema = z.object({
  elevatorPitch: z.string().describe("A very concise and compelling summary of the product, 1-2 sentences max."),
  detailedProblemStatement: z.string().describe("A clear and concise articulation of the problem the product solves."),
  detailedSolutionStatement: z.string().describe("How the product specifically addresses the defined problem."),
  keyFeaturesBullets: z.array(z.string()).min(3).max(5).describe("A bulleted list of 3-5 key features and their primary benefit."),
  targetAudienceProfile: z.string().describe("A brief profile of the ideal customer, highlighting their needs relevant to the product."),
  valueProposition: z.string().describe("A clear statement of the benefits the product provides and why it's valuable to the target audience."),
  uspHighlight: z.string().describe("A sentence or two emphasizing the unique selling proposition and competitive advantage."),
});
export type GenerateProductProfileOutput = z.infer<typeof GenerateProductProfileOutputSchema>;

export async function generateProductProfile(input: GenerateProductProfileInput): Promise<GenerateProductProfileOutput> {
  return generateProductProfileFlow(input);
}

const generateProductProfilePrompt = ai.definePrompt({
  name: 'generateProductProfilePrompt',
  input: {schema: GenerateProductProfileInputSchema},
  output: {schema: GenerateProductProfileOutputSchema},
  prompt: `You are an expert pitch deck writer and product marketer.
  Given the following product information:
  Product Name: {{{productName}}}
  Startup Idea Summary: {{{startupIdeaSummary}}}
  Core Features: {{{coreFeatures}}}
  Target Audience: {{{targetAudience}}}
  Problem Solved: {{{problemSolved}}}
  Unique Selling Proposition: {{{uniqueSellingProposition}}}

  Generate a precise and compelling Product Profile suitable for a pitch deck. Ensure each field in the output schema is filled with concise, impactful language.
  For 'keyFeaturesBullets', list 3-5 features, each with a brief benefit.
  The 'elevatorPitch' should be extremely short and punchy.
  The 'valueProposition' must clearly articulate the main benefit to the customer.
  The 'uspHighlight' should make the product stand out.
  Be specific and avoid vague marketing jargon.
  Focus on clarity and impact.
  `,
});

const generateProductProfileFlow = ai.defineFlow(
  {
    name: 'generateProductProfileFlow',
    inputSchema: GenerateProductProfileInputSchema,
    outputSchema: GenerateProductProfileOutputSchema,
  },
  async (input) => {
    const {output} = await generateProductProfilePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate product profile.');
    }
    // Ensure all fields are present, providing defaults for arrays if empty
    return {
      elevatorPitch: output.elevatorPitch || "Concise product pitch not yet generated.",
      detailedProblemStatement: output.detailedProblemStatement || "Problem statement not yet generated.",
      detailedSolutionStatement: output.detailedSolutionStatement || "Solution statement not yet generated.",
      keyFeaturesBullets: output.keyFeaturesBullets && output.keyFeaturesBullets.length > 0 ? output.keyFeaturesBullets : ["Key feature 1: Benefit", "Key feature 2: Benefit", "Key feature 3: Benefit"],
      targetAudienceProfile: output.targetAudienceProfile || "Target audience profile not yet generated.",
      valueProposition: output.valueProposition || "Value proposition not yet generated.",
      uspHighlight: output.uspHighlight || "Unique selling proposition not yet generated.",
    };
  }
);
    
