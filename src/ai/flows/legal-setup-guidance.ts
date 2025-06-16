
// Legal setup guidance flow.

'use server';

/**
 * @fileOverview Provides AI-driven guidance on the legal setup process for startups.
 *
 * - legalSetupGuidance - A function that provides legal setup guidance, documentation, and code generation.
 * - LegalSetupGuidanceInput - The input type for the legalSetupGuidance function.
 * - LegalSetupGuidanceOutput - The return type for the legalSetupGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalSetupGuidanceInputSchema = z.object({
  country: z.string().describe('The country where the business is being registered.'),
  businessType: z
    .string()
    .describe('The type of business (e.g., sole proprietorship, LLC, corporation).'),
  businessIdea: z.string().describe('A description of the startup idea.'),
  founderBackground: z
    .string()
    .describe('The background and experience of the founder.'),
  userName: z.string().optional().describe("The user's first name for personalization.")
});
export type LegalSetupGuidanceInput = z.infer<typeof LegalSetupGuidanceInputSchema>;

const LegalSetupGuidanceOutputSchema = z.object({
  recommendedStructure: z.string().optional().describe("The AI's recommended legal structure based on the inputs."),
  legalChecklist: z
    .string()
    .describe('A checklist of legal steps required to set up the business in the specified country, mentioning key registration bodies if applicable (e.g., CAC for Nigeria, IRS for EIN in the US).'),
  documentationTemplates: z.string().describe('Links or references to relevant documentation templates or draft previews of documents like a founder\'s agreement or basic terms of service.'),
  codeSnippets: z.string().describe('Code snippets for legal compliance (e.g., privacy policy).'),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer stating that this information is not legal advice and should not be substituted for advice from a licensed attorney.'
    ),
});
export type LegalSetupGuidanceOutput = z.infer<typeof LegalSetupGuidanceOutputSchema>;

export async function legalSetupGuidance(input: LegalSetupGuidanceInput): Promise<LegalSetupGuidanceOutput> {
  return legalSetupGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalSetupGuidancePrompt',
  input: {schema: LegalSetupGuidanceInputSchema},
  output: {schema: LegalSetupGuidanceOutputSchema},
  prompt: `You are a friendly and helpful legal AI assistant for HeyTek. The user's name is {{#if userName}}{{userName}}{{else}}Founder{{/if}}. Your goal is to provide clear, actionable, and country-specific guidance for startups.

  Country: {{{country}}}
  User's Initial Business Type Choice: {{{businessType}}}
  Business Idea: {{{businessIdea}}}
  Founder Background: {{{founderBackground}}}

  Based on the information provided, please:
  1.  Recommend a suitable legal structure for a startup like this in {{{country}}}. Explain briefly why. If the user's choice of '{{{businessType}}}' seems appropriate, confirm it. If not, suggest an alternative.
  2.  Provide a concise legal checklist for setting up this business in {{{country}}}. Be specific and mention key registration bodies (e.g., for Nigeria, mention the Corporate Affairs Commission - CAC; for the US, mention state-level registration and obtaining an EIN from the IRS).
  3.  Suggest where to find relevant documentation templates or what key clauses to include in "draft previews" of documents like a founder's agreement or basic terms of service.
  4.  Provide a generic example of a code snippet for legal compliance if applicable (e.g., a very basic privacy policy consent placeholder like a simple HTML comment or a short JavaScript snippet).
  5.  CRITICAL: Include a disclaimer stating: "This is AI-generated information for guidance purposes only and NOT legal advice. Always consult with a qualified legal professional in your jurisdiction for advice tailored to your specific situation."

  Output Format Instructions:
  -   recommendedStructure: [Your recommendation and brief reasoning]
  -   legalChecklist: [Bulleted or numbered list. Ensure each item is a separate point. For example: \n- Register your business name with [Relevant Body for {{{country}}}].\n- Obtain necessary licenses and permits specific to your industry in {{{country}}}.]
  -   documentationTemplates: [Suggestions for templates/drafts]
  -   codeSnippets: [If applicable, a simple snippet]
  -   disclaimer: [The exact disclaimer text as specified above]
  `,
});

const legalSetupGuidanceFlow = ai.defineFlow(
  {
    name: 'legalSetupGuidanceFlow',
    inputSchema: LegalSetupGuidanceInputSchema,
    outputSchema: LegalSetupGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure all fields are present, even if AI omits one, providing a default.
    return {
        recommendedStructure: output?.recommendedStructure || "The AI could not determine a specific recommendation based on the input. Please consult a local expert.",
        legalChecklist: output?.legalChecklist || "No specific checklist generated. General steps usually include registering your business name, obtaining necessary licenses, and understanding tax obligations in your country.",
        documentationTemplates: output?.documentationTemplates || "General templates for founder agreements or terms of service can often be found through legal tech platforms or startup resource sites. Ensure they are adapted for your jurisdiction.",
        codeSnippets: output?.codeSnippets || "No specific code snippets generated. Consider basic GDPR/CCPA consent banners if applicable to your target audience and location.",
        disclaimer: output?.disclaimer || "This is AI-generated information for guidance purposes only and NOT legal advice. Always consult with a qualified legal professional in your jurisdiction for advice tailored to your specific situation.",
    };
  }
);
