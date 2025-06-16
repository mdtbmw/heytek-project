
'use server';

/**
 * @fileOverview A flow that guides the user through a conversation to extract and clarify their startup idea and founder's background.
 * It aims for a more dynamic and encouraging interaction, culminating in a structured idea summary.
 * It can also handle commands like "just generate it" or "move to next phase" and remember specific facts.
 * It now supports mode switching between 'idea_refinement' and 'general_chat'.
 * It provides an ideaClarityScore to reflect how well-defined the idea is.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatModeSchema = z.enum(['idea_refinement', 'general_chat']);
export type ChatMode = z.infer<typeof ChatModeSchema>;

const ExtractStartupIdeaInputSchema = z.object({
  userInput: z.string().describe("The user's latest message in the conversation. Can be empty for the initial AI message if 'previousTurns' has context. Can also be a directive like 'Bootstrap idea from name: [CompanyName]'"),
  previousTurns: z.string().describe('The conversation history up to this point, with "AI:" and "User:" prefixes for each turn, separated by newlines. Can be empty if new conversation and userInput is also empty for AI to initiate.'),
  turnCount: z.number().describe('The number of turns the user has taken in the conversation. If previousTurns is provided from another context, this should reflect user turns in that context.'),
  userName: z.string().optional().describe("The user's first name, for personalization."),
  memoryItems: z.array(z.string()).optional().describe("Key facts or preferences the user wants the AI to remember for this session."),
  currentMode: ChatModeSchema.default('idea_refinement').describe("The current conversational mode: 'idea_refinement' for focused idea extraction, 'general_chat' for more open conversation."),
});
export type ExtractStartupIdeaInput = z.infer<typeof ExtractStartupIdeaInputSchema>;

const IdeaDetailsSchema = z.object({
  title: z.string().optional().describe("A catchy title for the startup idea. If unknown, use an encouraging placeholder like 'We'll craft a great title soon!'"),
  summary: z.string().describe("The core summary of the startup idea. If unknown, use an encouraging placeholder like 'Let's define this core concept together!'"),
  targetAudience: z.string().optional().describe("The primary target audience. If unknown, use an encouraging placeholder like 'We can pinpoint your audience shortly.'"),
  problem: z.string().optional().describe("The core problem the idea solves. If unknown, use an encouraging placeholder like 'We'll identify the key problem to solve.'"),
  solution: z.string().optional().describe("The proposed solution. If unknown, use placeholder like 'Let's shape the perfect solution.'"),
  uniqueness: z.string().optional().describe("What makes this idea unique. If unknown, use an encouraging placeholder like 'We'll discover your unique edge!'"),
  revenueModel: z.string().optional().describe("A potential revenue model. If unknown, use placeholder like 'How will this make money? We can brainstorm this!'"),
  keyRoadmapStep: z.string().optional().describe("One key first step for the roadmap. If unknown, use placeholder like 'What's the first big milestone? Let's think!'"),
});
export type IdeaDetails = z.infer<typeof IdeaDetailsSchema>;

const CommandResponseTypeSchema = z.enum([
    "PROCEED_TO_NEXT",
    "GENERATED_ALL_FROM_IDEA",
    "NORMAL_CONVERSATION",
    "ACKNOWLEDGED_MEMORY",
    "MODE_SWITCH_TO_GENERAL",
    "MODE_SWITCH_TO_REFINEMENT",
    "BOOTSTRAPPED_IDEA_FROM_NAME", 
]);

const ExtractStartupIdeaOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user's input."),
  isSummary: z.boolean().describe("True if the AI's response indicates a structured summary has been successfully parsed and the idea is considered 'cooked' (only in 'idea_refinement' mode)."),
  extractedDetails: IdeaDetailsSchema.optional().describe("The structured details of the startup idea, present if isSummary is true."),
  extractedFounderBackground: z.string().optional().describe("The summarized founder's background/angle. If unknown, use placeholder like 'We can explore your unique angle together.'"),
  suggestedName: z.string().optional().describe("A business name suggested by the AI, especially if 'just generate it' was used."),
  suggestedTagline: z.string().optional().describe("A tagline suggested by the AI, especially if 'just generate it' was used."),
  commandResponse: CommandResponseTypeSchema.default("NORMAL_CONVERSATION").describe("Indicates if a special command was processed."),
  acknowledgedMemoryItem: z.string().optional().describe("The specific item the AI acknowledged remembering, if a 'remember' command was processed."),
  suggestedNextMode: ChatModeSchema.optional().describe("If the AI suggests a mode switch, this field will contain the suggested mode."),
  ideaClarityScore: z.number().min(0).max(100).optional().describe("An estimated score from 0 to 100 representing how well-defined the startup idea is. Increases as more key aspects (problem, solution, audience, etc.) are clarified. A score of 70-80+ might indicate readiness for summarization. This should only be provided in 'idea_refinement' mode."),
});
export type ExtractStartupIdeaOutput = z.infer<typeof ExtractStartupIdeaOutputSchema>;

export async function extractStartupIdea(input: ExtractStartupIdeaInput): Promise<ExtractStartupIdeaOutput> {
  return extractStartupIdeaFlow(input);
}

const conversationPrompt = ai.definePrompt({
  name: 'conversationPrompt',
  input: {schema: z.object({
      previousTurns: z.string().describe('Previous conversation turns between the AI and the user, or an empty string if new conversation.'),
      userInput: z.string().describe("The user's most recent message. Can be empty if previousTurns is providing initial context. Can also be a directive like 'Bootstrap idea from name: [CompanyName]' to kickstart the process from an onboarding input."),
      turnCount: z.number().describe("The number of turns the user has taken. If previousTurns is a seed, this count starts from there."),
      userName: z.string().optional().describe("User's first name for personalization."),
      memoryItems: z.array(z.string()).optional().describe("Key facts or preferences the user wants the AI to remember for this session."),
      currentMode: ChatModeSchema.describe("The current operational mode: 'idea_refinement' or 'general_chat'."),
  })},
  output: {schema: z.object({
      nextTurn: z.string().describe("The AI agent's response for the current turn."),
      processedCommand: CommandResponseTypeSchema.optional().describe("If a command was processed, what type."),
      acknowledgedMemory: z.string().optional().describe("If a 'remember' command was processed, this field contains the item that was acknowledged as remembered."),
      suggestedNextModeOutput: ChatModeSchema.optional().describe("If the AI suggests switching modes, this specifies the target mode."),
      currentIdeaClarityScore: z.number().min(0).max(100).optional().describe("Only in 'idea_refinement' mode: Estimate the current clarity of the startup idea (0-100). 0-20: Vague. 20-40: Some elements emerging. 40-60: Problem/solution clearer. 60-80: Most key aspects touched upon. 80-95: Well-defined, ready for summary. 100: Summary generated. This score should increase as the user provides more specific details about their idea's problem, solution, audience, uniqueness, etc. Do NOT base this solely on turn count."),
  })},
  prompt: `You are Sparky, a super smart, youthful, and energetic AI assistant and best friend from HeyTek!
Your mission is to help your friend, {{{userName}}}, brainstorm and articulate their startup ideas with MASSIVE enthusiasm and clarity OR engage in general supportive chat, depending on the 'currentMode'.

Current Mode: {{{currentMode}}}

Your Memory:
{{#if memoryItems}}
You have the following items in your memory from {{{userName}}}:
{{#each memoryItems}}
- {{{this}}}
{{/each}}
Always keep these in mind.
{{else}}
You currently have no specific items in your short-term memory for this conversation.
{{/if}}

Interaction Style:
- Be incredibly encouraging, positive, and act like their best friend! Use emojis! 🎉🚀💡✨
- Keep responses concise but energetic.

Command Handling (Analyze LATEST User Input - '{{{userInput}}}'):
0. If user says "Sparky, remember: [FACT]" or similar:
   - Extract [FACT].
   - 'nextTurn' response: "You got it, {{{userName}}}! I've noted down: '[Extracted FACT]'. It's locked in! 🧠 What's next?"
   - 'processedCommand': 'ACKNOWLEDGED_MEMORY'.
   - 'acknowledgedMemory': '[Extracted FACT]'. Do NOT proceed with other logic this turn.

Mode Switching Commands:
A. If 'currentMode' is 'idea_refinement' AND user says "just chat", "normal conversation", "stop refining for now", "general chat", "switch to general chat":
   - 'nextTurn': "Okay, {{{userName}}}! Switching to general chat mode. What's on your mind? Feel free to ask me anything or just share your thoughts! 😊"
   - 'processedCommand': 'MODE_SWITCH_TO_GENERAL'.
   - 'suggestedNextModeOutput': 'general_chat'.
   - 'currentIdeaClarityScore': (output the last known score from idea_refinement mode, or 0 if none).
   - Do NOT generate a summary or ask idea-specific questions this turn.
B. If 'currentMode' is 'general_chat' AND user says "let's refine the idea", "back to idea extraction", "focus on my startup", "switch to idea refinement":
   - 'nextTurn': "Awesome, {{{userName}}}! Switching back to idea refinement mode. Let's get those brilliant startup thoughts flowing! Where were we, or what's the first thing you want to nail down? 🚀"
   - 'processedCommand': 'MODE_SWITCH_TO_REFINEMENT'.
   - 'suggestedNextModeOutput': 'idea_refinement'.
   - 'currentIdeaClarityScore': (output the last known score from idea_refinement mode or if it was a new idea being discussed in general_chat, make a rough estimate e.g., 20-30).
   - Do NOT continue general chat this turn.

Conversation History:
{{{previousTurns}}}

Your Task (if no command or mode switch is detected):

IF 'currentMode' is 'idea_refinement':
  - Your primary goal is to help {{{userName}}} define their startup idea by asking clarifying questions primarily focused on: **Problem, Solution, Target Audience, Uniqueness, and potential Revenue Model/Key Roadmap Step**. Minimize generic chitchat.
  - **Idea Clarity Score ('currentIdeaClarityScore'):**
    - After each user turn, re-evaluate the idea's clarity. If the user provides *any* definition for a core component (Problem, Solution, Audience, Uniqueness, Revenue Model, Roadmap Step), increase the score significantly (e.g., by 15-25 points per component). Vague answers get smaller increases. A well-described initial idea from the user can jump the score to 50-60 immediately.
    - If it's the very start (turnCount 0 or 1, or if previousTurns is empty/just an AI greeting), score is likely 0-10.
    - Target a score of 70-80 when you believe most key components have been touched upon, making it ready for a summary attempt.
    - If you successfully generate a SUMMARY_START/SUMMARY_END block, set score to 100.

  - SPECIAL CASE: Bootstrap from Onboarding Name
    - If 'userInput' starts with "Bootstrap idea from name: " AND ('previousTurns' is empty OR 'previousTurns' does not contain "User:") AND 'turnCount' is 1:
      - Extract the company name from 'userInput'. Let's say it is [CompanyName].
      - 'nextTurn' response: "Alright, {{{userName}}}! We've got the name '[CompanyName]' from your onboarding. I've sketched out a quick idea profile for it. Take a look and let me know your thoughts! We can refine this together. ✨"
      - Then, you **MUST** immediately generate the 'SUMMARY_START' and 'SUMMARY_END' block.
      - Inside this block, you **MUST** attempt to fill in ALL the following fields based on the company name '[CompanyName]' and general business plausibility (use creative, relevant placeholders if needed, but aim for plausible content): 'Title' (should be '[CompanyName]'), 'Summary' (e.g., "An innovative venture focused on [plausible area related to most company names or default to 'providing excellent services/products'] under the name [CompanyName]."), 'Target Audience' (e.g., "Individuals or businesses seeking [plausible benefit]"), 'Problem' (e.g., "Addressing the common challenge of [plausible problem or 'finding quality solutions']"), 'Solution' (e.g., "[CompanyName] aims to provide [plausible solution or 'a unique approach to meet these needs']"), 'Uniqueness' (e.g., "Our approach combines [plausible unique aspect or 'a commitment to quality and customer satisfaction']"), 'Revenue Model' (e.g., "Exploring various models like subscriptions or direct sales."), 'Key Roadmap Step' (e.g., "Further market validation and detailed product specification."), 'Founder's Angle' (e.g., "Leveraging {{{userName}}}'s passion and vision."), 'Suggested Name' ('[CompanyName]'), and 'Suggested Tagline' (e.g., "[CompanyName]: Innovate. Succeed." or "Building Futures with [CompanyName].").
      - Set 'processedCommand' to 'BOOTSTRAPPED_IDEA_FROM_NAME'.
      - Set 'currentIdeaClarityScore' to 100 (as a full summary is provided).
      - Do NOT ask further questions this turn.

  - Else if 'turnCount' is 0 (very first interaction in this session AND userInput is empty AND previousTurns is empty): "Hey there, {{{userName}}}! I'm Sparky, your HeyTek AI bestie, ready to brainstorm something absolutely epic with you! What awesome startup idea is lighting up your brain? Spill the beans – no pressure for perfection!" (Set 'currentIdeaClarityScore' to 5).
  - Else if 'userInput' is empty AND 'previousTurns' is NOT empty:
    - Examine the VERY LAST turn in 'previousTurns'.
    - If the last turn starts with "User:", then your 'nextTurn' should be a direct, thoughtful response to that User's last statement/question, continuing the refinement. Do NOT give a generic greeting or just prompt for next steps. (Adjust 'currentIdeaClarityScore' based on this interaction).
    - If the last turn starts with "AI:", then respond encouragingly, perhaps referencing that AI response, and prompt for next steps. (Maintain or slightly adjust 'currentIdeaClarityScore').
  - Else if 'userInput' is NOT empty:
    - **User Uncertainty:** If after 1-2 turns, the user's input is still very vague (clarity score < 30) or they express uncertainty ("I don't know", "not sure yet"), you can say: "No worries, {{{userName}}}! Sometimes the best ideas start a bit fuzzy. Based on what you mentioned about [mention any keyword/theme if present, otherwise 'your interest'], how about we explore an idea like [propose a very brief, concrete starting point - e.g., 'a local service connecting X with Y' or 'an app that helps people do Z']? We can then figure out the problem it solves together!" Then ask a direct question to refine THAT.
    - **Smarter Clarification / User Already Clear:** If the user's initial input is already quite detailed, acknowledge it: "Wow, {{{userName}}}, that sounds like a solid start! You've clearly thought about [mention one or two strong points they made, like 'the problem' or 'your unique angle']! To make sure I've got it, could you quickly tell me [ask ONE very specific clarifying question about a missing key component, e.g., 'who exactly is your main target audience for this?']?" Then, if their answer is clear, quickly move to suggesting a summary.
    - **Summarization Trigger:** After roughly 2-4 quality exchanges from the user (where they provide substantial input on key components), OR if 'currentIdeaClarityScore' reaches 70-80, consider if you have enough to summarize. You can say: "Okay, {{{userName}}}, I think I'm getting a good picture! Would you like me to try and summarize what we've got so far? Or is there anything else crucial you want to add first?"
      - If user agrees or implies to summarize: Generate the summary within 'SUMMARY_START' and 'SUMMARY_END' tags. Set 'currentIdeaClarityScore' to 100.
  - **"Just Generate It" / "Skip This" Commands:** If user says "just generate it for me", "you decide", "make something up", "skip all this", "figure it all out", "get to the summary", "I'm done with this", "let's finalize this", "next step now", "I don't have time for this":
      - Your conversational response before the summary block MUST be very brief and affirmative, e.g., "You got it, {{{userName}}}! Let's fast-track this and sketch out a full concept!" or "Okay, {{{userName}}}, jumping right to the big picture for you!"
      - Then, you **MUST** immediately generate the 'SUMMARY_START' and 'SUMMARY_END' block.
      - Inside this block, you **MUST** attempt to fill in ALL the following fields based on WHATEVER information is available, even if minimal (use creative, relevant placeholders if needed, but aim for plausible content): 'Title', 'Summary', 'Target Audience', 'Problem', 'Solution', 'Uniqueness', 'Revenue Model', 'Key Roadmap Step', 'Founder's Angle', 'Suggested Name', and 'Suggested Tagline'.
      - Set 'processedCommand' to 'GENERATED_ALL_FROM_IDEA'.
      - Set 'currentIdeaClarityScore' to 100. Do not ask further questions.
  - Set 'processedCommand': 'NORMAL_CONVERSATION' unless a specific command is triggered.
  - Always output a 'currentIdeaClarityScore' between 0 and 100.

IF 'currentMode' is 'general_chat':
  - Respond conversationally to '{{{userInput}}}'.
  - If 'userInput' is empty and 'previousTurns' is also empty (or only contains an AI greeting from idea mode switch): "Hey {{{userName}}}! We're in general chat mode. What's up? Ask me anything or let's just talk! ✨"
  - If 'userInput' seems to be strongly about exploring or defining a new business idea (e.g., multiple turns on this topic):
    - Your 'nextTurn' can be: "This sounds like a really exciting direction, {{{userName}}}! Would you like to switch to our dedicated Idea Refinement mode to explore this specific startup concept more deeply and get a structured summary?"
    - Set 'processedCommand': 'NORMAL_CONVERSATION'.
    - Set 'suggestedNextModeOutput': 'idea_refinement'. (DO NOT force the switch, just suggest it in 'nextTurn')
  - Otherwise, just have a friendly, helpful chat.
  - Set 'processedCommand': 'NORMAL_CONVERSATION'.
  - Do NOT output 'currentIdeaClarityScore' (or set to null/undefined if schema requires it) in general_chat mode.

IMPORTANT:
- Your 'processedCommand' output field MUST accurately reflect the action.
- Your 'suggestedNextModeOutput' MUST be set if you're suggesting or executing a mode switch.
- When generating a summary in 'idea_refinement' mode, it MUST be within 'SUMMARY_START' and 'SUMMARY_END'.
- Do not generate a summary block if in 'general_chat' mode.
`,
});

const extractStartupIdeaFlow = ai.defineFlow(
  {
    name: 'extractStartupIdeaFlow',
    inputSchema: ExtractStartupIdeaInputSchema,
    outputSchema: ExtractStartupIdeaOutputSchema,
  },
  async (input) => {
    let currentConversation = input.previousTurns;
    if (input.userInput.trim() !== '' && !input.userInput.startsWith("Bootstrap idea from name:")) {
      if (currentConversation) {
        currentConversation += '\n';
      }
      currentConversation += `User: ${input.userInput}`;
    }

    const promptResult = await conversationPrompt({
      previousTurns: currentConversation, 
      userInput: input.userInput, 
      turnCount: input.turnCount,
      userName: input.userName,
      memoryItems: input.memoryItems,
      currentMode: input.currentMode,
    });

    if (!promptResult.output || typeof promptResult.output.nextTurn !== 'string') {
        console.error('AI prompt did not return a valid nextTurn. Full prompt result:', promptResult);
        throw new Error('AI response was not in the expected format (missing nextTurn).');
    }

    const aiGeneratedResponse = promptResult.output.nextTurn;
    const processedCommandFromOutputSchema = promptResult.output.processedCommand || CommandResponseTypeSchema.enum.NORMAL_CONVERSATION;
    const acknowledgedMemoryItemFromOutput = promptResult.output.acknowledgedMemory;
    const suggestedNextModeFromAI = promptResult.output.suggestedNextModeOutput;
    const ideaClarityScoreFromAI = promptResult.output.currentIdeaClarityScore;

    let isSummary = false;
    let extractedDetails: IdeaDetails | undefined = undefined;
    let extractedFounderBackground: string | undefined = undefined;
    let suggestedName: string | undefined = undefined;
    let suggestedTagline: string | undefined = undefined;
    let finalAiResponseForUi = aiGeneratedResponse;

    const defaultPlaceholders = {
        title: (name?: string) => `A Sparkling New Vision for ${name || 'You'}! ✨`,
        summary: (name?: string) => `Let's define this core concept together, ${name || 'friend'}!`,
        targetAudience: (name?: string) => `We can pinpoint your audience for this idea, ${name || 'friend'}!`,
        problem: (name?: string) => `Let's identify the key problem your idea solves, ${name || 'friend'}!`,
        solution: (name?: string) => `Let's shape the perfect solution, ${name || 'friend'}!`,
        uniqueness: (name?: string) => `We'll discover your unique edge, ${name || 'friend'}!`,
        revenueModel: (name?: string) => `How will this make money? We can brainstorm this, ${name || 'friend'}!`,
        keyRoadmapStep: (name?: string) => `What's the first big milestone? Let's think, ${name || 'friend'}!`,
        founderBackground: (name?: string) => `We can explore your unique angle together, ${name || 'friend'}!`,
        suggestedName: (name?: string) => `VisionSpark by ${name || 'Me'}`,
        suggestedTagline: (name?: string) => `Sparking Innovation, Together!`,
    };
    
    const genericOrAISelfPlaceholders = [
        "not specified", "placeholder:", "let's define this core concept", "we can pinpoint your audience shortly", "we'll identify the key problem to solve", "let's shape the perfect solution", "we'll discover your unique edge", "how will this make money? we can brainstorm this", "what's the first big milestone? let's think", "we can explore your unique angle together", "awesome new venture for", "let's flesh out this brilliant concept", "we'll identify the perfect audience", "let's pinpoint the core problem", "let's design an amazing solution", "we'll discover what makes it special", "your unique perspective is key", "we'll figure out the money part", "one step at a time to greatness", "pinpointing the perfect audience for", "identifying the key problem", "designing the perfect solution with", "highlighting what makes", "exploring your unique perspective", "figuring out the revenue streams for", "charting the first major step for", "defining the core problem for", "crafting an amazing solution with", "discovering what makes", "exploring your unique spark for this", "brainstorming how your idea will thrive", "mapping the first giant leap for", "we'll craft a great title soon!", "user opted to skip direct summary generation", "visionSpark by", "sparking innovation, together!", "a catchy name is coming soon!", "let's craft a memorable tagline!"
    ];

    if (input.currentMode === 'idea_refinement' && aiGeneratedResponse && aiGeneratedResponse.includes("SUMMARY_START") && aiGeneratedResponse.includes("SUMMARY_END")) {
        isSummary = true;

        const summaryContent = aiGeneratedResponse.substring(
            aiGeneratedResponse.indexOf("SUMMARY_START") + "SUMMARY_START".length,
            aiGeneratedResponse.indexOf("SUMMARY_END")
        ).trim();
        
        const allKnownFieldsForRegex = ["Title", "Summary", "Target Audience", "Problem", "Solution", "Uniqueness", "Founder's Angle", "Revenue Model", "Key Roadmap Step", "Suggested Name", "Suggested Tagline"];

        const extractField = (regex: RegExp, content: string, defaultValKey: keyof typeof defaultPlaceholders, userNameForPlaceholder?: string, isOptionalField: boolean = true) => {
            const match = content.match(regex);
            let value = match && match[1] ? match[1].trim() : (isOptionalField ? undefined : defaultPlaceholders[defaultValKey](userNameForPlaceholder));
            
            if (value && (genericOrAISelfPlaceholders.some(p => value.toLowerCase().includes(p.toLowerCase())) && value.length < 90) ) {
                 value = isOptionalField ? undefined : defaultPlaceholders[defaultValKey](userNameForPlaceholder);
            }
            if (value === undefined && !isOptionalField) { 
                value = defaultPlaceholders[defaultValKey](userNameForPlaceholder);
            }
            return value;
        }
        
        const parsedTitle = extractField(fieldRegex("Title", allKnownFieldsForRegex.filter(f => f !== "Title")), summaryContent, 'title', input.userName, false); 
        const parsedSummary = extractField(fieldRegex("Summary", allKnownFieldsForRegex.filter(f => f !== "Summary")), summaryContent, 'summary', input.userName, false); 
        const parsedTargetAudience = extractField(fieldRegex("Target Audience", allKnownFieldsForRegex.filter(f => f !== "Target Audience")), summaryContent, 'targetAudience', input.userName);
        const parsedProblem = extractField(fieldRegex("Problem", allKnownFieldsForRegex.filter(f => f !== "Problem")), summaryContent, 'problem', input.userName);
        const parsedSolution = extractField(fieldRegex("Solution", allKnownFieldsForRegex.filter(f => f !== "Solution")), summaryContent, 'solution', input.userName);
        const parsedUniqueness = extractField(fieldRegex("Uniqueness", allKnownFieldsForRegex.filter(f => f !== "Uniqueness")), summaryContent, 'uniqueness', input.userName);

        let founderAngleText = extractField(fieldRegex("Founder's Angle", allKnownFieldsForRegex.filter(f => f !== "Founder's Angle")), summaryContent, 'founderBackground', input.userName);
        extractedFounderBackground = founderAngleText;

        const parsedRevenueModel = extractField(fieldRegex("Revenue Model", allKnownFieldsForRegex.filter(f => f !== "Revenue Model")), summaryContent, 'revenueModel', input.userName);
        const parsedKeyRoadmapStep = extractField(fieldRegex("Key Roadmap Step", allKnownFieldsForRegex.filter(f => f !== "Key Roadmap Step")), summaryContent, 'keyRoadmapStep', input.userName);

        let suggestedNameText = extractField(fieldRegex("Suggested Name", ["Suggested Tagline", "SUMMARY_END"]), summaryContent, 'suggestedName', input.userName, true);
        if (suggestedNameText && !genericOrAISelfPlaceholders.some(p => suggestedNameText!.toLowerCase().includes(p.toLowerCase())) ) {
            suggestedName = suggestedNameText;
        } else {
            // If bootstrapping, the title is the suggested name if AI doesn't provide a better one.
            if (processedCommandFromOutputSchema === CommandResponseTypeSchema.enum.BOOTSTRAPPED_IDEA_FROM_NAME && parsedTitle && !parsedTitle.startsWith("A Sparkling New Vision")){
                suggestedName = parsedTitle;
            } else {
                suggestedName = undefined; 
            }
        }
        
        let suggestedTaglineText = extractField(/Suggested Tagline:\s*([\s\S]*?)(?=SUMMARY_END|$)/i, summaryContent, 'suggestedTagline', input.userName, true);
        if(suggestedTaglineText && !genericOrAISelfPlaceholders.some(p => suggestedTaglineText!.toLowerCase().includes(p.toLowerCase()))) {
            suggestedTagline = suggestedTaglineText;
        } else {
            suggestedTagline = undefined;
        }

        const detailsToParse: IdeaDetails = {
            title: parsedTitle,
            summary: parsedSummary,
            targetAudience: parsedTargetAudience,
            problem: parsedProblem,
            solution: parsedSolution,
            uniqueness: parsedUniqueness,
            revenueModel: parsedRevenueModel,
            keyRoadmapStep: parsedKeyRoadmapStep,
        };

        try {
            const parsedResult = IdeaDetailsSchema.parse(detailsToParse);
            extractedDetails = {
                title: parsedResult.title || defaultPlaceholders.title(input.userName),
                summary: parsedResult.summary || defaultPlaceholders.summary(input.userName), 
                targetAudience: parsedResult.targetAudience, 
                problem: parsedResult.problem,
                solution: parsedResult.solution,
                uniqueness: parsedResult.uniqueness,
                revenueModel: parsedResult.revenueModel,
                keyRoadmapStep: parsedResult.keyRoadmapStep,
            };
            if (!extractedFounderBackground) extractedFounderBackground = defaultPlaceholders.founderBackground(input.userName);

        } catch (e) {
             console.error("Error parsing extracted details:", e, "Details attempted:", detailsToParse);
             isSummary = false; 
             finalAiResponseForUi = `Hmm, I tried to summarize, ${input.userName || 'friend'}, but the format got a little mixed up. Could you try rephrasing your last point or telling me a bit more about your core idea? 😊`;
             suggestedName = undefined;
             suggestedTagline = undefined;
        }

        if (isSummary) {
            finalAiResponseForUi = aiGeneratedResponse.replace(/SUMMARY_START[\s\S]*?SUMMARY_END/, "").trim();
            const userDisplayName = input.userName || 'visionary';

            if (processedCommandFromOutputSchema === CommandResponseTypeSchema.enum.GENERATED_ALL_FROM_IDEA) {
                finalAiResponseForUi = `⚡ Boom, ${userDisplayName}! I've sketched out a full concept for you based on our chat. Check it out! You can edit any part below. ${finalAiResponseForUi ? `\n\nSparky also said: "${finalAiResponseForUi}"` : ""}`.trim();
            } else if (processedCommandFromOutputSchema === CommandResponseTypeSchema.enum.PROCEED_TO_NEXT) {
                finalAiResponseForUi = `Onwards and upwards, ${userDisplayName}! Let's get to the next step. Here's what we have so far. ${finalAiResponseForUi ? `\n\nSparky's thoughts: "${finalAiResponseForUi}"` : ""}`.trim();
            } else if (processedCommandFromOutputSchema === CommandResponseTypeSchema.enum.BOOTSTRAPPED_IDEA_FROM_NAME) {
                 // The AI prompt already provides a good message for this case:
                 // "Alright, {{{userName}}}! We've got the name '{{Extracted Company Name}}' from your onboarding. I've sketched out a quick idea profile for it. Take a look and let me know your thoughts! We can refine this together. ✨"
                 // So, finalAiResponseForUi is already set correctly from aiGeneratedResponse.
            } else { 
                finalAiResponseForUi = `Whoa, ${userDisplayName}! You've just unlocked something powerful. Let’s take a look at what you've built... 👀💡 You can edit any part below! ${finalAiResponseForUi ? `\n\nSparky added: "${finalAiResponseForUi}"` : ""}`.trim();
            }
             if (finalAiResponseForUi.trim() === "" && processedCommandFromOutputSchema !== 'BOOTSTRAPPED_IDEA_FROM_NAME') {
                finalAiResponseForUi = `Alright, ${userDisplayName}, here's the idea snapshot based on our conversation! You can edit any details below.`;
            }
        }
    }


    return {
      aiResponse: finalAiResponseForUi,
      isSummary: isSummary,
      extractedDetails: extractedDetails,
      extractedFounderBackground: extractedFounderBackground,
      suggestedName: suggestedName,
      suggestedTagline: suggestedTagline,
      commandResponse: processedCommandFromOutputSchema,
      acknowledgedMemoryItem: acknowledgedMemoryItemFromOutput,
      suggestedNextMode: suggestedNextModeFromAI,
      ideaClarityScore: (input.currentMode === 'idea_refinement' && ideaClarityScoreFromAI !== undefined) ? ideaClarityScoreFromAI : undefined,
    };
  }
);

const fieldRegex = (fieldName: string, nextPotentialFields: string[]) => {
    const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lookaheads = nextPotentialFields.map(nf => `${nf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`).join('|');
    const finalLookahead = lookaheads ? `${lookaheads}|SUMMARY_END` : "SUMMARY_END";
    return new RegExp(`${escapedFieldName}\\s*:\\s*([\\s\\S]*?)(?=\\s*(?:${finalLookahead}|$))`, 'i');
};
    

    



      