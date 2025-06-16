
'use server';
/**
 * @fileOverview A Genkit flow for answering questions based on HeyTek's knowledge base.
 *
 * - askSparkyKB - A function that handles a user's question for the KB.
 * - KBChatInput - The input type for the askSparkyKB function.
 * - KBChatOutput - The return type for the askSparkyKB function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KBChatInputSchema = z.object({
  userInput: z.string().describe("The user's current question or message."),
  chatHistory: z.string().optional().describe('The conversation history up to this point, with "AI:" and "User:" prefixes for each turn, separated by newlines.'),
  knowledgeBaseSummary: z.string().describe("A summary of the HeyTek knowledge base content, including section titles, descriptions, and FAQs."),
});
export type KBChatInput = z.infer<typeof KBChatInputSchema>;

const KBChatOutputSchema = z.object({
  aiResponse: z.string().describe("Sparky's answer to the user's question, based on the provided knowledge base."),
});
export type KBChatOutput = z.infer<typeof KBChatOutputSchema>;

export async function askSparkyKB(input: KBChatInput): Promise<KBChatOutput> {
  return kbChatFlow(input);
}

const kbChatPrompt = ai.definePrompt({
  name: 'kbChatPrompt',
  input: {schema: KBChatInputSchema},
  output: {schema: KBChatOutputSchema},
  prompt: `You are Sparky, a friendly, helpful, and slightly witty AI assistant for HeyTek's Knowledge Base.
Your primary goal is to answer user questions based *only* on the provided "Knowledge Base Information" below.
Do not make up information or answer questions outside of this scope.

If the user's question is too vague, ask for clarification.
If the question is outside the scope of the provided knowledge base, politely state that you can only help with questions about HeyTek's features, platform, or how to use it, as described in the knowledge base. You can suggest they browse the KB sections for more info.
If the user asks a question you can answer from the knowledge base, provide a concise and helpful answer.
If you are greeting the user, be friendly and offer assistance.

Knowledge Base Information:
---
{{{knowledgeBaseSummary}}}
---

Chat History (if any):
---
{{{chatHistory}}}
---

User's Current Question: {{{userInput}}}

Based *only* on the Knowledge Base Information and Chat History, provide an answer to the User's Current Question.
If the question is unrelated to the Knowledge Base Information, or you cannot find a direct answer within it, respond with something like: "I'm Sparky, your HeyTek KB assistant! I can help with questions about HeyTek's platform, features, or how to get started. What would you like to know?" or "That's an interesting question! However, I can best assist with topics covered in our Knowledge Base. Have you had a chance to look through the sections on [mention a relevant section if possible, otherwise, general features]?"
`,
});

const kbChatFlow = ai.defineFlow(
  {
    name: 'kbChatFlow',
    inputSchema: KBChatInputSchema,
    outputSchema: KBChatOutputSchema,
  },
  async (input) => {
    const {output} = await kbChatPrompt(input);
    if (!output || !output.aiResponse) {
      // Fallback response if AI doesn't generate one for some reason
      return { aiResponse: "I'm sorry, I had a little glitch. Could you try asking that again or rephrasing?" };
    }
    return output;
  }
);
