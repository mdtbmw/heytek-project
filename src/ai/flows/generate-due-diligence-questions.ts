
'use server';
/**
 * @fileOverview A Genkit flow for generating due diligence questions for Investors.
 *
 * - generateDueDiligenceQuestions - A function that takes startup details and generates relevant questions.
 * - GenerateDueDiligenceQuestionsInput - The input type.
 * - GenerateDueDiligenceQuestionsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema is internal now, not exported
const GenerateDueDiligenceQuestionsInputSchema = z.object({
  startupIndustry: z.string().describe("The industry the startup operates in (e.g., SaaS, FinTech, AgriTech)."),
  investmentStage: z.string().describe("The current investment stage of the startup (e.g., Pre-seed, Seed, Series A, Growth)."),
  startupSummary: z.string().optional().describe("A brief summary of what the startup does."),
});
export type GenerateDueDiligenceQuestionsInput = z.infer<typeof GenerateDueDiligenceQuestionsInputSchema>;

const QuestionCategorySchema = z.object({
  categoryName: z.string().describe('The category of questions (e.g., "Team & Execution", "Product & Technology", "Market & Competition", "Financials & Projections", "Legal & Risks").'),
  questions: z.array(z.string()).describe('A list of specific questions within this category.'),
});

const GenerateDueDiligenceQuestionsOutputSchema = z.object({
  introduction: z.string().optional().describe("A brief introductory statement for the question set."),
  questionCategories: z.array(QuestionCategorySchema).describe("An array of question categories, each containing relevant questions."),
  finalConsideration: z.string().optional().describe("A final point for the investor to consider."),
});
export type GenerateDueDiligenceQuestionsOutput = z.infer<typeof GenerateDueDiligenceQuestionsOutputSchema>;

export async function generateDueDiligenceQuestions(input: GenerateDueDiligenceQuestionsInput): Promise<GenerateDueDiligenceQuestionsOutput> {
  return generateDueDiligenceQuestionsFlow(input);
}

const generateDueDiligenceQuestionsPrompt = ai.definePrompt({
  name: 'generateDueDiligenceQuestionsPrompt',
  input: {schema: GenerateDueDiligenceQuestionsInputSchema}, // Uses internal schema
  output: {schema: GenerateDueDiligenceQuestionsOutputSchema},
  prompt: `You are an experienced venture capital analyst assisting an investor on HeyTek.
  The investor needs a set of key due diligence questions for a potential investment.
  Startup Details:
  Industry: {{{startupIndustry}}}
  Investment Stage: {{{investmentStage}}}
  {{#if startupSummary}}Summary: {{{startupSummary}}}{{/if}}

  Please generate a structured list of 'questionCategories'. Common categories include:
  - Team & Execution Capability
  - Product & Technology
  - Market Opportunity & Competition
  - Business Model & Financial Projections
  - Legal, IP & Risks

  For each category, provide 3-5 targeted 'questions'.
  Optionally, add an 'introduction' and a 'finalConsideration' for the investor.
  The questions should be insightful and relevant to the startup's industry and stage.
  Ensure the output strictly adheres to the GenerateDueDiligenceQuestionsOutputSchema.
  The goal is to equip the investor with a solid starting point for their due diligence process.
  `,
});

const generateDueDiligenceQuestionsFlow = ai.defineFlow(
  {
    name: 'generateDueDiligenceQuestionsFlow',
    inputSchema: GenerateDueDiligenceQuestionsInputSchema, // Uses internal schema
    outputSchema: GenerateDueDiligenceQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await generateDueDiligenceQuestionsPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate due diligence questions.');
    }
    return output;
  }
);
    
