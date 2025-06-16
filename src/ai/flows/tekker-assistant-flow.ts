
'use server';
/**
 * @fileOverview A Genkit flow for the Tekker's dedicated chat assistant.
 * Helps Tekkers plan implementations, troubleshoot, and understand HeyTek processes.
 * Can flag when a plan is ready to be sent to the Implementation Planner.
 *
 * - tekkerAssistantChat - Handles a Tekker's chat input.
 * - TekkerAssistantInput - The input type.
 * - TekkerAssistantOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TekkerContextSchema = z.object({
  userName: z.string().describe("The Tekker's username."),
  mockActiveBuilds: z.array(z.string()).optional().describe("Mock list of titles of builds the Tekker is currently assigned to."),
  mockSpecializations: z.array(z.string()).optional().describe("Mock list of the Tekker's specializations (e.g., 'Next.js', 'Genkit Flow Deployment')."),
});

// Internal schema, not exported
const TekkerAssistantInputSchema = z.object({
  userInput: z.string().describe("The Tekker's current message."),
  chatHistory: z.string().optional().describe('The recent conversation history (e.g., last 5-7 turns), with "AI:" and "User:" prefixes, separated by newlines.'),
  tekkerContext: TekkerContextSchema.describe("Contextual information about the Tekker."),
});
export type TekkerAssistantInput = z.infer<typeof TekkerAssistantInputSchema>;

// Internal schema, not exported
const TekkerAssistantOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's conversational response to the Tekker."),
  isPlanReadyForPlanner: z.boolean().optional().describe("Set to true if the AI believes a coherent implementation plan for a specific Build has been formulated and is ready to be transferred to the AI Implementation Planner tool."),
  planSummary: z.string().optional().describe("If isPlanReadyForPlanner is true, this field contains a concise summary of the formulated plan. This summary will be used to pre-fill the AI Implementation Planner."),
});
export type TekkerAssistantOutput = z.infer<typeof TekkerAssistantOutputSchema>;

export async function tekkerAssistantChat(input: TekkerAssistantInput): Promise<TekkerAssistantOutput> {
  return tekkerAssistantChatFlow(input);
}

const tekkerAssistantPrompt = ai.definePrompt({
  name: 'tekkerAssistantPrompt',
  input: {schema: TekkerAssistantInputSchema}, 
  output: {schema: TekkerAssistantOutputSchema}, 
  prompt: `You are Sparky, an expert AI Build Strategist and Senior Tekker Lead for HeyTek.
Your current user is a Tekker named {{{tekkerContext.userName}}}.
{{#if tekkerContext.mockSpecializations}}They specialize in: {{#each tekkerContext.mockSpecializations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.{{/if}}
{{#if tekkerContext.mockActiveBuilds}}They are currently working on Builds titled: {{#each tekkerContext.mockActiveBuilds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.{{/if}}

Your primary goal is to assist {{{tekkerContext.userName}}} with:
- Planning the implementation of HeyTek 'Builds'.
- Understanding technical specifications or requirements.
- Troubleshooting common implementation challenges.
- Navigating HeyTek platform processes relevant to Tekkers (e.g., task completion, payment).
- Recommending best practices for their specializations.

Keep responses concise, actionable, and professional, but maintain your friendly Sparky persona.

Conversation History (if any):
{{{chatHistory}}}

Tekker's Current Message: {{{userInput}}}

Your Task:
1.  Respond helpfully to the Tekker's message based on their role and the context.
2.  If the Tekker is discussing planning a specific Build and you have collaboratively outlined key phases, tasks, or a general structure for **that specific Build**:
    a. Set 'isPlanReadyForPlanner' to true.
    b. In 'planSummary', provide a concise summary of this discussed plan (e.g., "Plan for 'Build Title X': Phase 1 - Setup (1 week), Phase 2 - Core AI (3 weeks), Phase 3 - UI (2 weeks)... Key tech: Next.js, Genkit."). This summary should be suitable for pre-filling the description in the AI Implementation Planner tool.
    c. Your 'aiResponse' should also confirm this, e.g., "Okay, I think we have a good high-level plan for 'Build Title X'! You can send this over to the AI Implementation Planner to get a more detailed task breakdown."
3.  Otherwise, set 'isPlanReadyForPlanner' to false and do not provide a 'planSummary'. If 'isPlanReadyForPlanner' is false, 'planSummary' MUST be null or undefined.

Do not generate full code, but you can provide pseudocode or conceptual snippets.
Focus on guiding the Tekker to create effective implementation strategies for their assigned Builds.
If asked about a specific Build they are working on (from mockActiveBuilds), tailor your advice to that Build if possible.
If they ask for general help or information, provide it clearly.
Ensure the output strictly adheres to the TekkerAssistantOutputSchema, especially the 'aiResponse' field which must always be a string.
`,
});

const tekkerAssistantChatFlow = ai.defineFlow(
  {
    name: 'tekkerAssistantChatFlow',
    inputSchema: TekkerAssistantInputSchema, 
    outputSchema: TekkerAssistantOutputSchema, 
  },
  async (input): Promise<z.infer<typeof TekkerAssistantOutputSchema>> => {
    const { output: llmOutput } = await tekkerAssistantPrompt(input);

    if (!llmOutput || typeof llmOutput.aiResponse !== 'string' || llmOutput.aiResponse.trim() === "") {
      // This case handles scenarios where the LLM fails to provide a response or an empty one.
      return {
        aiResponse: "Sorry, Sparky is having a little trouble forming a response for that. Could you try rephrasing?",
        isPlanReadyForPlanner: false, // Default to false
        planSummary: undefined,      // Default to undefined
      };
    }

    // If llmOutput and llmOutput.aiResponse are valid, construct the final object carefully.
    // Ensure optional fields are handled correctly (they can be undefined).
    return {
      aiResponse: llmOutput.aiResponse,
      isPlanReadyForPlanner: llmOutput.isPlanReadyForPlanner, // Will be undefined if not present
      planSummary: llmOutput.isPlanReadyForPlanner ? llmOutput.planSummary : undefined, // Only include planSummary if isPlanReadyForPlanner is true
    };
  }
);

