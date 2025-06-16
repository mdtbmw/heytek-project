
'use server';
/**
 * @fileOverview A Genkit flow for general conversational chat with Sparky, role-aware, and with ideation mode switching suggestion for founders, and tool guidance for other roles.
 * Now also handles investor queries about startup recommendations and suggests switching to Due Diligence tool.
 *
 * - generalChat - The exported async function that handles a user's chat input.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Mock Startup Data (for Investor Recommendation Demo) ---
const mockHeyTekStartups = [
  { id: 'opp1', name: 'EcoGrow Solutions', industry: 'AgriTech', stage: 'Seed', summary: 'AI-powered crop monitoring to increase yield and sustainability.' },
  { id: 'opp2', name: 'ConnectVerse', industry: 'Social Metaverse', stage: 'Pre-seed', summary: 'Decentralized social platform for creators and communities.' },
  { id: 'opp3', name: 'HealthTrack AI', industry: 'HealthTech', stage: 'Series A', summary: 'Predictive analytics for personalized patient care.' },
  { id: 'opp4', name: 'FinSecure', industry: 'FinTech', stage: 'Seed', summary: 'Blockchain-based security for financial transactions.' },
  { id: 'opp5', name: 'EduInnovate', industry: 'EdTech', stage: 'Pre-seed', summary: 'Gamified learning platform for K-12 students using adaptive AI.' },
];
// --- End Mock Startup Data ---


// Schema for the input of the general chat flow.
const GeneralChatInputSchema = z.object({
  userInput: z.string().describe("The user's current message."),
  chatHistory: z.string().optional().describe('The recent conversation history (e.g., last 3-5 turns), with "AI:" and "User:" prefixes, separated by newlines.'),
  userRole: z.string().optional().describe("The user's role on the HeyTek platform (e.g., 'founder_ceo', 'tekker', 'investor', 'brand_consultant')."),
  userName: z.string().optional().describe("The user's first name for personalization."),
  currentStartupName: z.string().optional().describe("The name of the user's current startup or idea, if known, for contextual responses (mostly relevant for founders)."),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

// Helper schema for tool output (internal)
const StartupOpportunitySchema = z.object({
    name: z.string(),
    industry: z.string(),
    stage: z.string(),
    summary: z.string(),
});

// Schema for the output of the general chat flow.
const GeneralChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's conversational response."),
  isIdeationTopic: z.boolean().nullable().optional().describe("True if the AI believes the current topic is related to business ideation (primarily for founder role). Set to null if not applicable."),
  suggestSwitchToIdeaMode: z.boolean().nullable().optional().describe("True if the AI (as a founder) suggests switching to the dedicated idea refinement mode. Set to null if not applicable."),
  suggestSwitchToTekkerChat: z.boolean().nullable().optional().describe("True if the AI (as a Tekker) suggests switching to the dedicated Tekker Chat Assistant page for more in-depth planning. Set to null if not applicable."),
  suggestedToolLink: z.string().nullable().optional().describe("A relative path to a suggested tool page if relevant (e.g., '/implementation-planner'). Set to null if not applicable."),
  suggestedToolMessage: z.string().nullable().optional().describe("A message to accompany the tool suggestion, e.g., 'For planning your build, the AI Implementation Planner can help!'. Set to null if not applicable."),
  suggestedStartups: z.array(StartupOpportunitySchema).nullable().optional().describe("A list of suggested startups if the investor asks for recommendations. Set to null if not applicable."),
  promptSwitchToDueDiligence: z.boolean().nullable().optional().describe("True if the AI suggests the investor switch to the Due Diligence tool. Set to null if not applicable."),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;


export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

// (Conceptual) Tool to get startup opportunities
const getHeyTekStartupOpportunitiesTool = ai.defineTool(
  {
    name: 'getHeyTekStartupOpportunitiesTool',
    description: 'Fetches a list of promising startup opportunities currently listed on the HeyTek platform. Use this if an investor asks for investment recommendations.',
    inputSchema: z.object({
        count: z.number().optional().default(3).describe("Number of startups to fetch."),
        // In a real scenario, add filters: industry, stage etc.
    }),
    outputSchema: z.array(StartupOpportunitySchema),
  },
  async ({ count = 3 }) => {
    // Mock implementation: return a random subset of mockHeyTekStartups
    const shuffled = mockHeyTekStartups.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
);


const generalChatPrompt = ai.definePrompt({
  name: 'generalChatPrompt',
  input: {schema: GeneralChatInputSchema},
  output: {schema: GeneralChatOutputSchema},
  tools: [getHeyTekStartupOpportunitiesTool], // Make tool available
  prompt: `You are Sparky, a friendly, helpful, and energetic AI assistant for HeyTek.
Your user's name is {{#if userName}}{{userName}}{{else}}there{{/if}}.
Their current role on HeyTek is: {{userRole}}. Tailor your helpfulness and examples to this role. Be concise and engaging!

{{#if currentStartupName}}You are aware the user is working on an idea or company called: "{{currentStartupName}}". Reference this if relevant to the conversation for a founder, but don't force it.{{/if}}

Conversation History (if any):
{{{chatHistory}}}

User's Current Message: {{{userInput}}}

Your Task:
1.  Respond to the user's message in a conversational, friendly, and helpful manner. Be concise.
2.  Analyze the user's current message AND the recent 'chatHistory'.

ROLE-SPECIFIC GUIDANCE:

IF userRole is 'founder_ceo':
  a. If the user's current message or recent chat history (last 1-2 turns) mentions a *new business idea*, a *startup concept*, a *problem they want to solve with a business*, their *business plan*, or key ideation elements (e.g., "I'm thinking of starting X", "My idea is to Y", "What if we built Z?"), set 'isIdeationTopic' to true. Be more proactive in identifying this, even from a single relevant message.
  b. If 'isIdeationTopic' is true, AND you haven't suggested it in the *immediately preceding* AI response for this same ideation topic, then your 'aiResponse' SHOULD include a friendly suggestion like: "This sounds like an exciting direction, {{userName}}! Would you like me to help you explore and refine this in our dedicated Idea Igniter? We can structure your thoughts there! 🚀" and set 'suggestSwitchToIdeaMode' to true. Don't wait for too many turns if the topic is clearly about ideation.
  c. Otherwise, provide general assistance relevant to a founder. If the user says something like "let's just chat", then ensure 'isIdeationTopic' and 'suggestSwitchToIdeaMode' are null (or false) for this turn.

IF userRole is 'tekker':
  a. If the user's query is about **planning a Build, understanding implementation phases, task breakdown, or estimating effort for a specific HeyTek Build**, your 'aiResponse' should guide them to the 'AI Implementation Planner' tool. Set 'suggestedToolLink' to '/implementation-planner' and 'suggestedToolMessage' to something like: "For detailed planning of your Build, the AI Implementation Planner can help you structure phases and tasks. You'll input the Build's title and description there. 🛠️"
  b. If the Tekker's query suggests a need for **more in-depth, conversational planning assistance for a Build (e.g., "help me plan out Build X", "let's talk through the steps for this project", "tell me more about how to approach this implementation")**, you MAY suggest switching to the dedicated Tekker Chat Assistant. Your 'aiResponse' could be: "This sounds like a good point to dive deeper. Would you like to switch to the dedicated Tekker Chat Assistant for more detailed planning help on this? 💬" and set 'suggestSwitchToTekkerChat' to true.
  c. For other technical questions, provide direct assistance.

IF userRole is 'investor':
  a. If the user's query is about **evaluating a specific startup, due diligence, or specific questions to ask founders for a startup they ALREADY MENTIONED**, guide them to the 'AI Due Diligence Question Generator'. Set 'suggestedToolLink' to '/due-diligence-questions', 'suggestedToolMessage' to "The AI Due Diligence Question Generator can create tailored questions based on the startup's industry and stage.", AND set 'promptSwitchToDueDiligence' to true. Your 'aiResponse' should be something like: "Great! To help you evaluate {{#if currentStartupName}}{{currentStartupName}}{{else}}this startup{{/if}}, the AI Due Diligence Question Generator can be very helpful. Would you like to switch to that tool now? 🧐"
  b. If the user asks for **investment recommendations, what startups to invest in, or to see some opportunities**, use the 'getHeyTekStartupOpportunitiesTool' to fetch a few (2-3) example startups.
     - Your 'aiResponse' should list these startups with a brief summary. Example: "Okay, I found a few interesting HeyTek startups: 1. EcoGrow (AgriTech, Seed): AI for crop monitoring. 2. ConnectVerse (Social Metaverse, Pre-seed): Decentralized social platform. Would you like to analyze any of these further with our AI Due Diligence Question Generator? 🚀"
     - Set 'suggestedStartups' in the output with the details of the startups you listed.
     - Set 'promptSwitchToDueDiligence' to true.
  c. For other general investment-related queries, provide direct assistance.

IF userRole is 'brand_consultant':
  a. If the user's query is about **defining brand voice, personality, or communication style for a client**, guide them to the 'AI Brand Voice Generator'. Set 'suggestedToolLink' to '/brand-voice-tool' and 'suggestedToolMessage' to: "To help your client define their brand's personality, try the AI Brand Voice Generator. It suggests archetypes and examples. 🎨"
  b. For other branding or consulting queries, provide direct assistance.

IF userRole is 'other' or not specified:
  a. Engage in general helpful conversation. Avoid specific tool suggestions unless very clear.

GENERAL RULES:
- If the user explicitly says something like "stop suggesting tools", "let's just chat", then ensure relevant suggestion flags are false (or null) and respond conversationally.
- Keep responses concise and engaging.
- If the user's query seems like a command to navigate or find a tool directly, try to be helpful but remind them the search bar can also find tools.
- Do not try to generate long lists, complex data structures, or code in this general chat. Keep it conversational.

Strictly adhere to the output schema.
For any optional fields in the output schema (booleans, strings, arrays): if a field is not applicable to this specific response, you MUST explicitly set its value to null (not the string "null"). Do NOT omit the field.
Example: If no tool is suggested, the output should include 'suggestedToolLink: null' and 'suggestedToolMessage: null'. If no startups are suggested, the output should include 'suggestedStartups: null'. If 'isIdeationTopic' is not relevant (e.g. for non-founders, or if the topic is not about ideation), the output should include 'isIdeationTopic: null'.

If 'suggestedStartups' is populated (not null and not empty), 'promptSwitchToDueDiligence' MUST be true.
If 'promptSwitchToDueDiligence' is true (and not because startups were recommended), 'suggestedToolLink' should point to '/due-diligence-questions'.
`,
});

const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async (input): Promise<GeneralChatOutput> => {
    // Initialize with defaults to ensure schema compliance, all optionals as null
    let finalOutput: GeneralChatOutput = {
      aiResponse: "Sorry, Sparky is having a little trouble forming a response. Please try again.",
      isIdeationTopic: null,
      suggestSwitchToIdeaMode: null,
      suggestSwitchToTekkerChat: null,
      suggestedToolLink: null,
      suggestedToolMessage: null,
      suggestedStartups: null,
      promptSwitchToDueDiligence: null,
    };

    let llmOutput: GeneralChatOutput | undefined;
    let promptHistory: any[] | undefined;

    try {
      const result = await generalChatPrompt(input);
      llmOutput = result.output;
      promptHistory = result.history; // Capture history

      if (llmOutput) {
        // Ensure all fields are explicitly set to null if not provided by LLM, or keep LLM value
        finalOutput = {
          aiResponse: (typeof llmOutput.aiResponse === 'string' && llmOutput.aiResponse.trim() !== "")
              ? llmOutput.aiResponse
              : finalOutput.aiResponse, // Keep default error if LLM response is empty
          isIdeationTopic: llmOutput.isIdeationTopic !== undefined ? llmOutput.isIdeationTopic : null,
          suggestSwitchToIdeaMode: llmOutput.suggestSwitchToIdeaMode !== undefined ? llmOutput.suggestSwitchToIdeaMode : null,
          suggestSwitchToTekkerChat: llmOutput.suggestSwitchToTekkerChat !== undefined ? llmOutput.suggestSwitchToTekkerChat : null,
          suggestedToolLink: llmOutput.suggestedToolLink !== undefined ? llmOutput.suggestedToolLink : null,
          suggestedToolMessage: llmOutput.suggestedToolMessage !== undefined ? llmOutput.suggestedToolMessage : null,
          suggestedStartups: llmOutput.suggestedStartups !== undefined ? llmOutput.suggestedStartups : null,
          promptSwitchToDueDiligence: llmOutput.promptSwitchToDueDiligence !== undefined ? llmOutput.promptSwitchToDueDiligence : null,
        };
      }
    } catch (error: any) {
      console.error('Error calling generalChatPrompt:', error);
      // If it's a Google API error (like 503), customize the message
      if (error.message && error.message.includes('GoogleGenerativeAI Error')) {
          finalOutput.aiResponse = "Sparky's connection to the core AI is a bit busy right now. Please try again in a few moments! 🛠️";
      } else {
          finalOutput.aiResponse = "Sparky is experiencing high demand and couldn't process your request. Please try again! 🛠️";
      }
      // All other fields remain null as per initialization
      return finalOutput;
    }
    
    let toolResponses = [];
    if (promptHistory && Array.isArray(promptHistory)) { // Check if promptHistory exists and is an array
        toolResponses = promptHistory.filter(
            (entry) => entry.role === 'tool' && entry.parts[0]?.toolResponse?.name === 'getHeyTekStartupOpportunitiesTool'
        );
    }


    if (toolResponses.length > 0 && toolResponses[0].parts[0]?.toolResponse?.output) {
        try {
            const startupsFromTool = toolResponses[0].parts[0].toolResponse.output as Array<z.infer<typeof StartupOpportunitySchema>>;
            finalOutput.suggestedStartups = startupsFromTool.length > 0 ? startupsFromTool : null;
            
            if (startupsFromTool.length > 0) {
                finalOutput.promptSwitchToDueDiligence = true;
            }

            if (startupsFromTool.length > 0 && (!finalOutput.aiResponse.includes(startupsFromTool[0].name) || finalOutput.aiResponse === "Sorry, Sparky is having a little trouble forming a response. Please try again.")) {
                 let startupListText = startupsFromTool
                    .slice(0,3) 
                    .map((s, idx) => `${idx + 1}. ${s.name} (${s.industry}, ${s.stage}): ${s.summary.substring(0,50)}...`)
                    .join(' ');
                 finalOutput.aiResponse = `Okay, I found a few interesting HeyTek startups: ${startupListText} Would you like to analyze any of these further with our AI Due Diligence Question Generator? 🚀`;
            } else if (startupsFromTool.length === 0 && finalOutput.aiResponse === "Sorry, Sparky is having a little trouble forming a response. Please try again.") {
                finalOutput.aiResponse = "I looked for startup recommendations but couldn't find any matching your query right now. You can still use the Due Diligence tool if you have a specific company in mind!";
                 finalOutput.promptSwitchToDueDiligence = true; 
            }
        } catch (e) {
            console.error("Error processing 'getHeyTekStartupOpportunitiesTool' tool response:", e);
            if (finalOutput.aiResponse === "Sorry, Sparky is having a little trouble forming a response. Please try again.") {
               finalOutput.aiResponse = "I found some startups but had trouble formatting them. You can try asking again, or head to the Due Diligence tool to analyze a specific company.";
            }
            finalOutput.promptSwitchToDueDiligence = true; 
            finalOutput.suggestedStartups = null;
        }
    }

    if (typeof finalOutput.aiResponse !== 'string' || finalOutput.aiResponse.trim() === "") {
        console.error("Final output for generalChatFlow resulted in empty or invalid aiResponse. LLM output:", llmOutput, "Computed finalOutput:", finalOutput);
        finalOutput.aiResponse = "I'm currently unable to provide a response. Please try again later."; 
    }

    return finalOutput;
  }
);

