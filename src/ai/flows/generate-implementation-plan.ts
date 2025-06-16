
'use server';
/**
 * @fileOverview A Genkit flow for generating a technical implementation plan for Tekkers.
 *
 * - generateImplementationPlan - A function that takes a Build's details and generates an implementation plan.
 * - GenerateImplementationPlanInput - The input type for the generateImplementationPlan function.
 * - GenerateImplementationPlanOutput - The return type for the generateImplementationPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImplementationPlanInputSchema = z.object({
  buildTitle: z.string().describe("The title of the HeyTek Build to be implemented."),
  buildDescription: z.string().describe("A summary of the Build, including its core purpose and key features expected."),
  keyTechnologies: z.array(z.string()).optional().describe("Known key technologies or platforms to be used (e.g., Next.js, Firebase, Genkit)."),
});
export type GenerateImplementationPlanInput = z.infer<typeof GenerateImplementationPlanInputSchema>;

const PhaseTaskSchema = z.object({
  taskName: z.string().describe('A concise name for the implementation task.'),
  taskDescription: z.string().optional().describe('A brief description of what the task involves.'),
});

const ImplementationPhaseSchema = z.object({
  phaseName: z.string().describe('The name of the implementation phase (e.g., "Foundation Setup", "Core Feature Development", "UI/UX Implementation", "Testing & QA", "Deployment").'),
  estimatedDuration: z.string().optional().describe('A rough estimate of the time this phase might take (e.g., "1-2 Weeks").'),
  keyTasks: z.array(PhaseTaskSchema).describe('A list of key tasks within this phase.'),
  potentialChallenges: z.array(z.string()).optional().describe('Potential challenges or considerations for this phase.'),
});

const GenerateImplementationPlanOutputSchema = z.object({
  planTitle: z.string().describe("A suggested title for the implementation plan."),
  phases: z.array(ImplementationPhaseSchema).describe("An array of implementation phases."),
  overallConsiderations: z.array(z.string()).optional().describe("General advice or considerations for the Tekker."),
});
export type GenerateImplementationPlanOutput = z.infer<typeof GenerateImplementationPlanOutputSchema>;

export async function generateImplementationPlan(input: GenerateImplementationPlanInput): Promise<GenerateImplementationPlanOutput> {
  return generateImplementationPlanFlow(input);
}

const generateImplementationPlanPrompt = ai.definePrompt({
  name: 'generateImplementationPlanPrompt',
  input: {schema: GenerateImplementationPlanInputSchema},
  output: {schema: GenerateImplementationPlanOutputSchema},
  prompt: `You are a senior technical project manager assisting a Tekker (Implementer) on the HeyTek platform.
  The Tekker needs a high-level technical implementation plan for the following "Build":
  Build Title: {{{buildTitle}}}
  Build Description: {{{buildDescription}}}
  {{#if keyTechnologies}}Key Technologies: {{#each keyTechnologies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

  Please generate a structured implementation plan. The plan should typically include these phases:
  1.  Briefing & Specification Review
  2.  Environment & Foundation Setup (auth, DB structure, basic project scaffolding)
  3.  Core Feature Implementation (backend logic, AI flow integration if any)
  4.  UI/UX Implementation (frontend components, pages, responsiveness based on HeyTek designs)
  5.  Content & Data Population (if applicable)
  6.  Testing & Quality Assurance (unit tests, integration tests, UAT prep)
  7.  Deployment & Handover (production deployment, documentation)

  For each phase:
  - Provide a 'phaseName'.
  - Suggest an 'estimatedDuration' (e.g., "1 Week", "2-3 Days").
  - List 3-5 'keyTasks', each with a 'taskName' and an optional 'taskDescription'.
  - Optionally, list 1-2 'potentialChallenges'.

  Also provide an overall 'planTitle' for this document.
  Optionally, include 1-2 'overallConsiderations' for the Tekker.
  Ensure the output adheres to the GenerateImplementationPlanOutputSchema.
  The goal is a practical, actionable high-level plan to guide the Tekker's 3-month implementation effort.
  `,
});

const generateImplementationPlanFlow = ai.defineFlow(
  {
    name: 'generateImplementationPlanFlow',
    inputSchema: GenerateImplementationPlanInputSchema,
    outputSchema: GenerateImplementationPlanOutputSchema,
  },
  async (input) => {
    const {output} = await generateImplementationPlanPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate implementation plan.');
    }
    return output;
  }
);
    
