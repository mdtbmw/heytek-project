
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { extractStartupIdea, type ExtractStartupIdeaInput, type ExtractStartupIdeaOutput, type IdeaDetails, type ChatMode } from '@/ai/flows/extract-startup-idea-flow';
import { Lightbulb, Send, CornerDownLeft, AlertTriangle, Sparkles, ArrowRight, Rocket, Zap, Edit2, RefreshCw, Wand2, Brain, PlusCircle, Trash2, MessageSquare, List, Loader2, PanelLeft, HelpCircle, Command, ExternalLink, MoreVertical, Star, Archive, ArchiveRestore } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface IdeaSessionState {
  id: string;
  name: string;
  lastModified: number;
  conversation: ChatMessage[];
  userTurnCount: number;
  rememberedFacts: string[];
  isConversationEnded: boolean;
  showSnapshot: boolean;
  editableSnapshotDetails?: Partial<IdeaDetails>;
  founderBackground?: string | null;
  chatMode: ChatMode;
  ideaClarityScore?: number;
  isFavorite?: boolean;
  isArchived?: boolean;
  isFromOnboardingBootstrap?: boolean;
}

const IDEA_SESSIONS_LOCAL_KEY = 'heytekIdeaSessions_v3';
const ACTIVE_SESSION_ID_LOCAL_KEY = 'heytekActiveIdeaSessionId_v3';

const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
const FOUNDER_BACKGROUND_KEY = 'heytekFounderBackground';
const BUSINESS_NAME_KEY = 'heytekBusinessName';
const BRAND_TAGLINE_KEY = 'heytekBrandTagline';
const HEADER_CHAT_CONTEXT_KEY_FOR_IDEA_IGNITER = 'headerChatContextForIdeaExtractor';
const ONBOARDING_IDEA_PROCESSED_KEY = 'heytekOnboardingIdeaProcessed_v1';


const initialIdeaDetails: IdeaDetails = {
    title: '', summary: '', targetAudience: '', problem: '', solution: '', uniqueness: '', revenueModel: '', keyRoadmapStep: '',
};

const createNewSession = (idSuffix: string = Date.now().toString()): IdeaSessionState => ({
  id: `session_idea_${idSuffix}`,
  name: `New Idea Session - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  lastModified: Date.now(),
  conversation: [],
  userTurnCount: 0,
  rememberedFacts: [],
  isConversationEnded: false,
  showSnapshot: false,
  editableSnapshotDetails: { ...initialIdeaDetails },
  founderBackground: null,
  chatMode: 'idea_refinement',
  ideaClarityScore: 0,
  isFavorite: false,
  isArchived: false,
  isFromOnboardingBootstrap: false,
});

const SparkyHelpContentIdeaIgniter = () => (
  <DialogContent className="sm:max-w-lg bg-card dark:bg-card/95">
    <DialogHeader>
      <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
        <Sparkles className="h-6 w-6 animate-pulse-once" />
        Sparky's Idea Igniter Guide
      </DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Let's make the most of your brainstorming with Sparky! Here are some tips and commands:
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[60vh] pr-3">
      <div className="space-y-4 py-2 text-sm">
        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Lightbulb size={18} className="text-primary" /> How Sparky Helps:</h4>
          <p className="text-muted-foreground">Sparky is your energetic AI pal, here to chat through your startup ideas. It asks questions to help clarify your vision, problem, solution, target audience, and more. The "Idea Spark Meter" shows how well-defined your idea is becoming!</p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5"><Command size={18} className="text-primary" /> Key Commands for Sparky:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <Brain size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Remember Facts:</strong> Type <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">Sparky, remember: [your fact]</code>.
                <p className="text-xs text-muted-foreground">Sparky will keep this fact in mind for the current session.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <MessageSquare size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Switch Mode:</strong> Type <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">switch to general chat</code> or <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">switch to idea refinement</code>.
                <p className="text-xs text-muted-foreground">Toggle between focused idea work and casual conversation.</p>
              </div>
            </li>
             <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <List size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Request Summary:</strong> Type <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">let's get a summary</code> or <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">summarize this</code>.
                <p className="text-xs text-muted-foreground">Sparky will try to create the idea snapshot based on your chat.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <Wand2 size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Generate/Skip:</strong> Type <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">just generate it</code>, <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">skip all this</code>, or <code className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">next step</code>.
                <p className="text-xs text-muted-foreground">Sparky will try to create the idea profile and move you forward, even with minimal info.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Zap size={18} className="text-primary" /> Tips for Best Results:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4 text-xs">
            <li>Be as specific as you can about your idea.</li>
            <li>If Sparky misunderstands, try rephrasing your point.</li>
            <li>Use the "remember" command for key details you don't want Sparky to forget.</li>
            <li>The Idea Snapshot is editable! Refine it before proceeding.</li>
          </ul>
        </div>
      </div>
    </ScrollArea>
    <DialogFooter className="pt-4">
      <DialogClose asChild>
        <Button type="button" variant="outline" className="w-full">Got it, Sparky!</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
);


export default function IdeaExtractorPage() {
  const [sessionState, setSessionState] = useState<IdeaSessionState>(createNewSession('initial'));
  const [savedSessions, setSavedSessions] = useState<IdeaSessionState[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSessionsPanelOpen, setIsMobileSessionsPanelOpen] = useState(false);
  const [isSessionsPanelDesktopCollapsed, setIsSessionsPanelDesktopCollapsed] = useState(false);
  const [dialogSessionId, setDialogSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);


  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, onboardingData: authOnboardingData } = useAuth();
  const userName = user?.username || user?.email?.split('@')[0] || 'Visionary';
  const isMobile = useIsMobile();

  const hasProcessedHeaderContext = useRef(false);
  const initializingSession = useRef(false);
  const processingOnboardingBootstrap = useRef(false);

  const saveSessionsToLocalStorage = useCallback((sessionsToSave: IdeaSessionState[], activeIdToSave?: string) => {
    try {
      localStorage.setItem(IDEA_SESSIONS_LOCAL_KEY, JSON.stringify(sessionsToSave));
      if (activeIdToSave) {
        localStorage.setItem(ACTIVE_SESSION_ID_LOCAL_KEY, activeIdToSave);
      }
    } catch (e) {
      console.warn("Could not save sessions to localStorage:", e);
      toast({ title: "Storage Error", description: "Could not save all chat sessions.", variant: "destructive"});
    }
  }, [toast]);

  const saveCurrentSessionDetails = useCallback(() => {
    if (sessionState.id === 'session_idea_initial' || sessionState.id.startsWith('session_idea_placeholder_')) return;

    setSavedSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionState.id);
      let updatedName = sessionState.name;
      if (sessionState.name.startsWith("New Idea Session") && sessionState.editableSnapshotDetails?.title && !sessionState.editableSnapshotDetails.title.startsWith("A Sparkling New Vision") && sessionState.editableSnapshotDetails.title.length > 0) {
        updatedName = sessionState.editableSnapshotDetails.title.substring(0,35) + (sessionState.editableSnapshotDetails.title.length > 35 ? "..." : "");
      } else if (sessionState.name.startsWith("New Idea Session") && sessionState.conversation.length > 0) {
         const firstMeaningfulMessage = sessionState.conversation.find(m => m.sender === 'user' || (m.sender === 'ai' && !m.text.toLowerCase().includes("hey there") && !m.text.toLowerCase().includes("let's brainstorm")) );
         if (firstMeaningfulMessage) {
            updatedName = firstMeaningfulMessage.text.substring(0, 30) + "...";
         }
      }

      const updatedSession = { ...sessionState, lastModified: Date.now(), name: updatedName };
      let newSessions;
      if (existingIndex > -1) {
        newSessions = [...prevSessions];
        newSessions[existingIndex] = updatedSession;
      } else {
        newSessions = [updatedSession, ...prevSessions.filter(s => s.id !== updatedSession.id)];
      }
      const sortedSessions = newSessions.sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.lastModified - a.lastModified);
      saveSessionsToLocalStorage(sortedSessions, sessionState.id);
      return sortedSessions;
    });
  }, [sessionState, saveSessionsToLocalStorage]);

  const formatPreviousTurns = (messages: ChatMessage[]): string => {
    return messages.map(msg => `${msg.sender === 'ai' ? 'AI' : 'User'}: ${msg.text}`).join('\n');
  };

  const makeInitialAICall = useCallback(async (targetSession: IdeaSessionState) => {
    if (initializingSession.current || targetSession.conversation.length > 0) return;
    initializingSession.current = true;
    setIsLoading(true);
    setError(null);

    try {
        const result = await extractStartupIdea({
            userInput: '',
            previousTurns: '',
            turnCount: 0,
            userName,
            memoryItems: targetSession.rememberedFacts,
            currentMode: targetSession.chatMode,
        });
        const aiMessage: ChatMessage = { id: Date.now().toString(), text: result.aiResponse, sender: 'ai' };

        setSessionState(prev => ({
            ...targetSession,
            conversation: [aiMessage],
            userTurnCount: 0,
            ideaClarityScore: result.ideaClarityScore || (targetSession.chatMode === 'idea_refinement' ? 5 : undefined),
            lastModified: Date.now(),
        }));
    } catch (err) {
        console.error('Error making initial AI call:', err);
        setError(`Sparky couldn't start the conversation. Please try again or select another session.`);
        setSessionState(prev => ({...prev, conversation: [{id: 'err-init', text: 'Error starting chat.', sender: 'ai'}]}));
    } finally {
        setIsLoading(false);
        initializingSession.current = false;
    }
  }, [userName]);


  const bootstrapFromOnboarding = useCallback(async (companyNameFromOnboarding: string) => {
    if (processingOnboardingBootstrap.current || initializingSession.current) return;
    processingOnboardingBootstrap.current = true;
    initializingSession.current = true;
    setIsLoading(true);
    setError(null);
    toast({ title: "Sparky is Sketching!", description: `Generating an initial idea profile for "${companyNameFromOnboarding}"...`, icon: <Loader2 className="animate-spin" /> });

    const onboardingBootstrapSession = createNewSession(`onboarding_${Date.now()}`);
    onboardingBootstrapSession.name = companyNameFromOnboarding.substring(0, 30) + (companyNameFromOnboarding.length > 30 ? "..." : " (Onboarding Sketch)");
    onboardingBootstrapSession.isFromOnboardingBootstrap = true;
    setSessionState(onboardingBootstrapSession); // Set as active immediately

    try {
      const result = await extractStartupIdea({
        userInput: `Bootstrap idea from name: ${companyNameFromOnboarding}`,
        previousTurns: "",
        turnCount: 1,
        userName,
        memoryItems: [],
        currentMode: 'idea_refinement',
      });

      if (result.isSummary && result.extractedDetails && result.commandResponse === 'BOOTSTRAPPED_IDEA_FROM_NAME') {
        const finalSessionState: IdeaSessionState = {
          ...onboardingBootstrapSession,
          conversation: [{id: 'ai-bootstrap-intro', text: result.aiResponse || "Here's an initial sketch for your idea!", sender: 'ai'}],
          editableSnapshotDetails: { ...initialIdeaDetails, ...result.extractedDetails, title: result.extractedDetails.title || companyNameFromOnboarding },
          founderBackground: result.extractedFounderBackground || null,
          isConversationEnded: true,
          showSnapshot: true,
          ideaClarityScore: 100,
          chatMode: 'idea_refinement',
          lastModified: Date.now(),
        };
        setSessionState(finalSessionState); // Update with full details
        setSavedSessions(prev => [finalSessionState, ...prev.filter(s => s.id !== finalSessionState.id)].sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.lastModified - a.lastModified));
        localStorage.setItem(ACTIVE_SESSION_ID_LOCAL_KEY, finalSessionState.id);
        sessionStorage.setItem(ONBOARDING_IDEA_PROCESSED_KEY, 'true');
        toast({ title: "Idea Sketch Ready!", description: `Review and refine the profile for "${companyNameFromOnboarding}".`, icon: <Rocket /> });
      } else {
         throw new Error("AI did not return a summary for onboarding bootstrap or incorrect command response.");
      }

    } catch (err) {
      console.error('Error bootstrapping from onboarding:', err);
      toast({ title: "Bootstrap Failed", description: "Could not generate initial sketch. Starting a normal session.", variant: "destructive" });
      sessionStorage.setItem(ONBOARDING_IDEA_PROCESSED_KEY, 'true');
      setSessionState(prev => ({...prev, isFromOnboardingBootstrap: false})); // Revert bootstrap flag
      startNewIdeaSession(true);
    } finally {
      setIsLoading(false);
      initializingSession.current = false;
      processingOnboardingBootstrap.current = false;
    }
  }, [userName, toast, saveSessionsToLocalStorage]);

  const startNewIdeaSession = useCallback((isFirstSessionEver = false) => {
    if (initializingSession.current) return;
    if (!isFirstSessionEver && sessionState.id !== 'session_idea_initial' && !sessionState.id.startsWith('session_idea_placeholder_')) {
        saveCurrentSessionDetails();
    }
    const newSession = createNewSession();
    setSessionState(newSession);
    setSavedSessions(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)].sort((a,b)=> (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.lastModified - a.lastModified));
    localStorage.setItem(ACTIVE_SESSION_ID_LOCAL_KEY, newSession.id);
    makeInitialAICall(newSession);
    if (isMobile) setIsMobileSessionsPanelOpen(false);
  }, [saveCurrentSessionDetails, makeInitialAICall, sessionState.id, isMobile]);


  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      const storedSessionsString = localStorage.getItem(IDEA_SESSIONS_LOCAL_KEY);
      let loadedSessions: IdeaSessionState[] = [];
      if (storedSessionsString) {
          try {
              loadedSessions = JSON.parse(storedSessionsString).sort((a: IdeaSessionState, b: IdeaSessionState) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified);
              setSavedSessions(loadedSessions);
          } catch (e) { console.warn("Could not parse saved idea sessions", e); }
      }
      const activeId = localStorage.getItem(ACTIVE_SESSION_ID_LOCAL_KEY);
      const sessionToLoad = loadedSessions.find(s => s.id === activeId);

      if (sessionToLoad) {
        setSessionState(sessionToLoad);
      } else if (loadedSessions.length > 0) {
        setSessionState(loadedSessions[0]);
        localStorage.setItem(ACTIVE_SESSION_ID_LOCAL_KEY, loadedSessions[0].id);
      } else {
        setSessionState(createNewSession(`placeholder_${Date.now()}`)); // Placeholder to avoid immediate save
      }
      setIsLoaded(true);
    }
  }, [isLoaded]);


  useEffect(() => {
    if (!isLoaded || initializingSession.current || processingOnboardingBootstrap.current) return;

    // Handle Onboarding Bootstrap
    const onboardingIdeaProcessed = sessionStorage.getItem(ONBOARDING_IDEA_PROCESSED_KEY) === 'true';
    const companyNameFromOnboarding = authOnboardingData?.founderSetup?.companyName;

    if (user?.primaryRole === 'founder_ceo' && companyNameFromOnboarding && !onboardingIdeaProcessed && !hasProcessedHeaderContext.current) {
        bootstrapFromOnboarding(companyNameFromOnboarding);
        return;
    }

    // Handle Header Context Transfer
    if (!hasProcessedHeaderContext.current) {
        const headerContextString = sessionStorage.getItem(HEADER_CHAT_CONTEXT_KEY_FOR_IDEA_IGNITER);
        if (headerContextString) {
            sessionStorage.removeItem(HEADER_CHAT_CONTEXT_KEY_FOR_IDEA_IGNITER);
            hasProcessedHeaderContext.current = true;
            initializingSession.current = true;

            try {
                const headerMessages: ChatMessage[] = JSON.parse(headerContextString);
                if (headerMessages.length > 0) {
                    const newSessionFromHeader = createNewSession(`header_${Date.now()}`);
                    newSessionFromHeader.name = headerMessages.find(m => m.sender === 'user')?.text.substring(0, 30) + "..." || newSessionFromHeader.name;
                    setSessionState(newSessionFromHeader); // Set as active
                    setIsLoading(true);

                    extractStartupIdea({
                        userInput: '',
                        previousTurns: formatPreviousTurns(headerMessages),
                        turnCount: headerMessages.filter(msg => msg.sender === 'user').length,
                        userName,
                        memoryItems: newSessionFromHeader.rememberedFacts,
                        currentMode: 'idea_refinement',
                    }).then(result => {
                        const aiResponseMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: result.aiResponse, sender: 'ai' };
                        const finalConversation = [...headerMessages, aiResponseMsg];
                        const fullyInitializedSession: IdeaSessionState = {
                            ...newSessionFromHeader,
                            conversation: finalConversation,
                            userTurnCount: headerMessages.filter(msg => msg.sender === 'user').length,
                            chatMode: result.suggestedNextMode || 'idea_refinement',
                            isConversationEnded: result.isSummary,
                            showSnapshot: result.isSummary,
                            editableSnapshotDetails: result.isSummary && result.extractedDetails ? { ...initialIdeaDetails, ...result.extractedDetails } : { ...initialIdeaDetails },
                            founderBackground: result.isSummary ? result.extractedFounderBackground || null : null,
                            ideaClarityScore: result.ideaClarityScore || 5,
                            lastModified: Date.now(),
                        };
                        setSessionState(fullyInitializedSession);
                        setSavedSessions(prev => [fullyInitializedSession, ...prev.filter(s => s.id !== fullyInitializedSession.id)].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.lastModified - a.lastModified));
                        localStorage.setItem(ACTIVE_SESSION_ID_LOCAL_KEY, fullyInitializedSession.id);
                        toast({ title: "Switched to Idea Igniter!", description: "Continuing your thoughts from the header chat.", icon: <Lightbulb /> });
                    }).catch(err => {
                        console.error("Error initializing from header context:", err);
                        startNewIdeaSession(true);
                    }).finally(() => {
                        setIsLoading(false);
                        initializingSession.current = false;
                    });
                    return;
                }
            } catch (e) {
              console.error("Error processing header context:", e);
              initializingSession.current = false;
            }
             hasProcessedHeaderContext.current = true; // Mark as processed even if context was empty/invalid
        }
    }

    // Default Initialization (if not bootstrapped or header-transferred)
    if (sessionState.id.startsWith('session_idea_placeholder_') && !hasProcessedHeaderContext.current && !(user?.primaryRole === 'founder_ceo' && companyNameFromOnboarding && !onboardingIdeaProcessed) ) {
        if (savedSessions.length > 0) {
            loadSessionById(savedSessions[0].id);
        } else {
            startNewIdeaSession(true);
        }
    } else if (sessionState.conversation.length === 0 && !sessionState.isConversationEnded && !sessionState.showSnapshot && !sessionState.isFromOnboardingBootstrap) {
        makeInitialAICall(sessionState);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userName, authOnboardingData?.founderSetup?.companyName, user?.primaryRole]); // Removed callbacks from here to prevent loops, relying on refs and one-time flags

  useEffect(() => {
    if (isLoaded && !sessionState.id.startsWith('session_idea_placeholder_') && sessionState.id !== 'session_idea_initial') {
      saveCurrentSessionDetails();
    }
  }, [sessionState, saveCurrentSessionDetails, isLoaded]);


  useEffect(() => {
    if (scrollAreaRef.current && !sessionState.showSnapshot) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [sessionState.conversation, sessionState.showSnapshot]);


  const getProgressColor = (value: number): string => {
    if (value < 30) return '[&>div]:bg-yellow-400 dark:[&>div]:bg-yellow-600';
    if (value < 70) return '[&>div]:bg-orange-500 dark:[&>div]:bg-orange-600';
    return '[&>div]:bg-primary';
  };

  const defaultPlaceholders = {
    title: (name?: string) => `A Sparkling New Vision for ${name || 'You'}! ✨`,
    summary: (name?: string) => `Let's define this core concept together, ${name || 'friend'}!`,
    founderBackground: (name?: string) => `We can explore your unique angle together, ${name || 'friend'}!`,
    targetAudience: (name?: string) => `Let's pinpoint the perfect audience for ${name || 'your idea'}!`,
    problem: (name?: string) => `Identifying the key problem ${name ? `for ${name}`: ''} is crucial.`,
    solution: (name?: string) => `Let's design an amazing solution with ${name || 'you'}!`,
    uniqueness: (name?: string) => `Highlighting what makes ${name || 'your idea'} stand out!`,
    revenueModel: (name?: string) => `Figuring out the revenue streams for ${name || 'your venture'}.`,
    keyRoadmapStep: (name?: string) => `Charting the first major step for ${name || 'your success'}.`,
    suggestedName: (name?: string) => `VisionSpark by ${name || 'Me'}`,
    suggestedTagline: (name?: string) => `Sparking Innovation, Together!`,
  };

  const proceedToNextStep = (data: ExtractStartupIdeaOutput | IdeaDetails, isFromSnapshotDirectly = false) => {
    let finalDetailsToSave: IdeaDetails;
    let finalFounderBackground: string | undefined;
    let finalSuggestedName: string | undefined;
    let finalSuggestedTagline: string | undefined;
    let commandResponseType: string | undefined;

    if (isFromSnapshotDirectly) {
        const currentSnapshot = sessionState.editableSnapshotDetails as IdeaDetails;
        finalDetailsToSave = {
            title: currentSnapshot?.title || defaultPlaceholders.title(userName),
            summary: currentSnapshot?.summary || defaultPlaceholders.summary(userName),
            targetAudience: currentSnapshot?.targetAudience || defaultPlaceholders.targetAudience(userName),
            problem: currentSnapshot?.problem || defaultPlaceholders.problem(userName),
            solution: currentSnapshot?.solution || defaultPlaceholders.solution(userName),
            uniqueness: currentSnapshot?.uniqueness || defaultPlaceholders.uniqueness(userName),
            revenueModel: currentSnapshot?.revenueModel || defaultPlaceholders.revenueModel(userName),
            keyRoadmapStep: currentSnapshot?.keyRoadmapStep || defaultPlaceholders.keyRoadmapStep(userName),
        };
        finalFounderBackground = sessionState.founderBackground || defaultPlaceholders.founderBackground(userName);

        finalSuggestedName = sessionState.editableSnapshotDetails?.title || defaultPlaceholders.suggestedName(userName);
        if (sessionState.editableSnapshotDetails?.title && (sessionState.editableSnapshotDetails.title.startsWith("A Sparkling New Vision") || sessionState.editableSnapshotDetails.title.startsWith("Sparkling New Idea") )) {
            finalSuggestedName = undefined;
        }
        finalSuggestedTagline = defaultPlaceholders.suggestedTagline(userName);

        commandResponseType = finalSuggestedName ? "GENERATED_ALL_FROM_IDEA" : "NORMAL_CONVERSATION";

    } else {
        const aiData = data as ExtractStartupIdeaOutput;
        finalDetailsToSave = {
            title: sessionState.editableSnapshotDetails?.title || aiData.extractedDetails?.title || defaultPlaceholders.title(userName),
            summary: sessionState.editableSnapshotDetails?.summary || aiData.extractedDetails?.summary || defaultPlaceholders.summary(userName),
            targetAudience: sessionState.editableSnapshotDetails?.targetAudience || aiData.extractedDetails?.targetAudience || defaultPlaceholders.targetAudience(userName),
            problem: sessionState.editableSnapshotDetails?.problem || aiData.extractedDetails?.problem || defaultPlaceholders.problem(userName),
            solution: sessionState.editableSnapshotDetails?.solution || aiData.extractedDetails?.solution || defaultPlaceholders.solution(userName),
            uniqueness: sessionState.editableSnapshotDetails?.uniqueness || aiData.extractedDetails?.uniqueness || defaultPlaceholders.uniqueness(userName),
            revenueModel: sessionState.editableSnapshotDetails?.revenueModel || aiData.extractedDetails?.revenueModel || defaultPlaceholders.revenueModel(userName),
            keyRoadmapStep: sessionState.editableSnapshotDetails?.keyRoadmapStep || aiData.extractedDetails?.keyRoadmapStep || defaultPlaceholders.keyRoadmapStep(userName),
        };
        finalFounderBackground = sessionState.founderBackground || aiData.extractedFounderBackground || defaultPlaceholders.founderBackground(userName);
        finalSuggestedName = aiData.suggestedName;
        finalSuggestedTagline = aiData.suggestedTagline;
        commandResponseType = aiData.commandResponse;
    }

    sessionStorage.setItem(IDEA_DETAILS_KEY, JSON.stringify(finalDetailsToSave));
    if (finalFounderBackground) sessionStorage.setItem(FOUNDER_BACKGROUND_KEY, finalFounderBackground);

    if (finalSuggestedName && !finalSuggestedName.includes("VisionSpark by") && !finalSuggestedName.includes("A catchy name is coming soon!") && !finalSuggestedName.includes("Sparkling New Idea")) {
        sessionStorage.setItem(BUSINESS_NAME_KEY, finalSuggestedName);
    } else {
        sessionStorage.removeItem(BUSINESS_NAME_KEY);
    }
    if (finalSuggestedTagline && !finalSuggestedTagline.includes("Sparking Innovation, Together!") && !finalSuggestedTagline.includes("Let's craft a memorable tagline!")) {
        sessionStorage.setItem(BRAND_TAGLINE_KEY, finalSuggestedTagline);
    } else {
        sessionStorage.removeItem(BRAND_TAGLINE_KEY);
    }

    let nextPage = '/name-generator';
    let toastMessage = `Let's get this amazing idea a name, ${userName}!`;

    if ((commandResponseType === "GENERATED_ALL_FROM_IDEA" || commandResponseType === "BOOTSTRAPPED_IDEA_FROM_NAME") && sessionStorage.getItem(BUSINESS_NAME_KEY)) {
      toastMessage = `Fantastic, ${userName}! Name and tagline suggested. Moving to Brand Elements!`;
      nextPage = '/brand-generator';
    } else if (commandResponseType === "PROCEED_TO_NEXT") {
        if(sessionStorage.getItem(BUSINESS_NAME_KEY)) {
            nextPage = '/brand-generator';
            toastMessage = `Alright, ${userName}, skipping to brand generation!`;
        } else {
            toastMessage = `On to naming your idea, ${userName}!`;
        }
    } else if (isFromSnapshotDirectly && sessionStorage.getItem(BUSINESS_NAME_KEY)){
        nextPage = '/brand-generator';
        toastMessage = `Great, ${userName}! Moving to brand generation with "${sessionStorage.getItem(BUSINESS_NAME_KEY)}".`;
    }


    toast({
      title: (finalDetailsToSave?.title && !finalDetailsToSave.title.startsWith("A Sparkling New Vision")) ? finalDetailsToSave.title : "Idea Captured!",
      description: toastMessage, icon: <Rocket className="h-5 w-5 text-primary" />,
    });
    router.push(nextPage);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || (sessionState.showSnapshot && sessionState.chatMode === 'idea_refinement') || isLoading) return;

    const currentUserInput = userInput;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), text: currentUserInput, sender: 'user' };

    const newTurnCount = sessionState.userTurnCount + 1;
    const conversationForHistory = [...sessionState.conversation, newUserMessage];

    setSessionState(prev => ({...prev, conversation: conversationForHistory, userTurnCount: newTurnCount, lastModified: Date.now()}));
    setUserInput('');
    setIsLoading(true);
    setError(null);

    const prevTurnsString = formatPreviousTurns(sessionState.conversation);

    try {
      const result: ExtractStartupIdeaOutput = await extractStartupIdea({
        userInput: currentUserInput,
        previousTurns: prevTurnsString,
        turnCount: newTurnCount,
        userName,
        memoryItems: sessionState.rememberedFacts,
        currentMode: sessionState.chatMode,
      });

      const aiResponseMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: result.aiResponse, sender: 'ai' };
      let newChatMode = sessionState.chatMode;

      if (result.suggestedNextMode && result.suggestedNextMode !== sessionState.chatMode) {
        newChatMode = result.suggestedNextMode;
        toast({title: "Mode Switched!", description: `Sparky switched to ${newChatMode.replace('_', ' ')} mode.`, icon: <RefreshCw />});
      }

      let newRememberedFacts = [...sessionState.rememberedFacts];
      if (result.commandResponse === "ACKNOWLEDGED_MEMORY" && result.acknowledgedMemoryItem) {
         if (!newRememberedFacts.includes(result.acknowledgedMemoryItem)) {
            newRememberedFacts.push(result.acknowledgedMemoryItem);
         }
         toast({ title: "Sparky Noted!", description: `Added to memory: "${result.acknowledgedMemoryItem}"`, icon: <Brain className="h-5 w-5 text-primary"/> });
      }

      setSessionState(prev => ({
        ...prev,
        conversation: [...prev.conversation, aiResponseMsg],
        rememberedFacts: newRememberedFacts,
        chatMode: newChatMode,
        isConversationEnded: newChatMode === 'idea_refinement' ? result.isSummary : false,
        showSnapshot: newChatMode === 'idea_refinement' ? result.isSummary : false,
        ideaClarityScore: result.ideaClarityScore !== undefined ? result.ideaClarityScore : (newChatMode === 'idea_refinement' ? prev.ideaClarityScore : undefined),
        lastModified: Date.now(),
      }));

      if (newChatMode === 'idea_refinement' && result.isSummary && result.extractedDetails) {
        const mergedDetails: Partial<IdeaDetails> = { ...initialIdeaDetails, ...result.extractedDetails };
        setSessionState(prev => ({
            ...prev,
            editableSnapshotDetails: mergedDetails,
            founderBackground: result.extractedFounderBackground || null,
            ideaClarityScore: 100,
        }));

        if (result.suggestedName && !result.suggestedName.includes("VisionSpark by") && !result.suggestedName.includes("A catchy name is coming soon!")) {
            sessionStorage.setItem(BUSINESS_NAME_KEY, result.suggestedName);
        }
        if (result.suggestedTagline && !result.suggestedTagline.includes("Sparking Innovation, Together!") && !result.suggestedTagline.includes("Let's craft a memorable tagline!")) {
            sessionStorage.setItem(BRAND_TAGLINE_KEY, result.suggestedTagline);
        }

        if (result.commandResponse === "PROCEED_TO_NEXT" || result.commandResponse === "GENERATED_ALL_FROM_IDEA") {
           setTimeout(() => proceedToNextStep(result), 300);
        }
      }
    } catch (err) {
      console.error('Error interacting with AI:', err);
      setError('Oops! Sparky had a hiccup. Please try sending your message again.');
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: "Sorry, I couldn't process that. Please try again.", sender: 'ai' };
      setSessionState(prev => ({...prev, conversation: [...prev.conversation, errorMessage]}));
      toast({ title: "AI Error", description: "Sparky had a glitch. Please try your message again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTalkMoreFromSnapshot = () => {
    if (!sessionState.isFromOnboardingBootstrap && !sessionState.editableSnapshotDetails) return;

    const firstAIMessage = `Great, ${userName}! We have this initial profile for "${sessionState.editableSnapshotDetails?.title || 'your idea'}". What are your thoughts? Or, what aspect (like the problem, solution, or target audience) would you like to refine first?`;

    setSessionState(prev => ({
        ...prev,
        showSnapshot: false,
        isConversationEnded: false,
        isFromOnboardingBootstrap: false,
        conversation: [{ id: 'ai-refine-start', text: firstAIMessage, sender: 'ai'}],
        userTurnCount: 0,
        ideaClarityScore: prev.ideaClarityScore === 100 ? 80 : (prev.ideaClarityScore || 50),
        lastModified: Date.now(),
    }));
    setUserInput('');
  };

  const handleSnapshotDetailChange = (field: keyof IdeaDetails, value: string) => {
    setSessionState(prev => ({...prev, editableSnapshotDetails: {...prev.editableSnapshotDetails, [field]: value} as Partial<IdeaDetails>, lastModified: Date.now()}));
  };

  const EditableField = ({ label, value, fieldName, placeholder }: { label: string; value?: string; fieldName: keyof IdeaDetails; placeholder?: string; }) => (
    <div className="animate-slide-in" style={{animationDelay: '0.2s'}}>
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-semibold text-primary">{label}:</h4>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-auto py-0.5 px-1.5"
          onClick={() => toast({title: "Regenerate (Soon!)", description:`Field-specific regeneration for "${label}" is coming soon!`})}>
          <RefreshCw size={13} className="mr-1" /> <span className="text-xs">Regen</span>
        </Button>
      </div>
      <Textarea
        value={value || ''}
        onChange={(e) => handleSnapshotDetailChange(fieldName, e.target.value)}
        placeholder={placeholder || `Tell me about the ${label.toLowerCase()}...`}
        className="text-sm text-muted-foreground bg-background/50 focus-visible:ring-accent"
        rows={fieldName === 'summary' ? 3 : (fieldName === 'title' ? 1: 2)}
      />
    </div>
  );

  const handleToggleFavorite = (sessionId: string) => {
    setSavedSessions(prev => prev.map(s => s.id === sessionId ? {...s, isFavorite: !s.isFavorite, lastModified: Date.now()} : s).sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified));
    if (sessionState.id === sessionId) setSessionState(prev => ({...prev, isFavorite: !prev.isFavorite, lastModified: Date.now()}));
  };

  const handleToggleArchive = (sessionId: string) => {
    setSavedSessions(prev => prev.map(s => s.id === sessionId ? {...s, isArchived: !s.isArchived, lastModified: Date.now()} : s).sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified));
     if (sessionState.id === sessionId) setSessionState(prev => ({...prev, isArchived: !prev.isArchived, lastModified: Date.now()}));
    toast({title: "Session Archived (Mock)", description: "Archived sessions will be hidden in a future update."});
  };

  const handleRenameSession = (sessionId: string, currentName: string) => {
    const newName = window.prompt("Enter new name for this session:", currentName);
    if (newName && newName.trim() !== "") {
      setSavedSessions(prev => prev.map(s => s.id === sessionId ? {...s, name: newName.trim(), lastModified: Date.now()} : s).sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified));
      if (sessionState.id === sessionId) setSessionState(prev => ({...prev, name: newName.trim(), lastModified: Date.now()}));
    }
  };

  const confirmDeleteSession = () => {
    if (!dialogSessionId) return;
    const sessionToDelete = savedSessions.find(s => s.id === dialogSessionId);
    if (!sessionToDelete) return;

    const updatedSessions = savedSessions.filter(s => s.id !== dialogSessionId);
    setSavedSessions(updatedSessions.sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified));
    saveSessionsToLocalStorage(updatedSessions, updatedSessions.length > 0 ? updatedSessions[0].id : undefined);

    toast({ title: "Session Deleted", description: `"${sessionToDelete.name}" has been removed.` });

    if (sessionState.id === dialogSessionId) {
      if (updatedSessions.length > 0) {
        loadSessionById(updatedSessions[0].id);
      } else {
        startNewIdeaSession(true);
      }
    }
    setDialogSessionId(null);
  };

  const loadSessionById = useCallback((sessionId: string) => {
    if (sessionState.id === sessionId || initializingSession.current) return;
    const sessionToLoad = savedSessions.find(s => s.id === sessionId);
    if (sessionToLoad) {
      if (sessionState.id !== 'session_idea_initial' && !sessionState.id.startsWith('session_idea_placeholder_')) saveCurrentSessionDetails();
      setSessionState(sessionToLoad);
      localStorage.setItem(ACTIVE_SESSION_ID_LOCAL_KEY, sessionId);
      toast({ title: "Session Loaded", description: `Switched to "${sessionToLoad.name}".` });
      if (isMobile) setIsMobileSessionsPanelOpen(false);
      if (sessionToLoad.conversation.length === 0 && !sessionToLoad.isConversationEnded && !sessionToLoad.showSnapshot && !sessionToLoad.isFromOnboardingBootstrap) {
         makeInitialAICall(sessionToLoad);
      }
    } else {
      toast({ title: "Error", description: "Could not find session to load.", variant: "destructive" });
    }
  }, [savedSessions, toast, makeInitialAICall, saveCurrentSessionDetails, sessionState.id, isMobile]);


  const sessionsPanelContent = (
     <div className={cn("flex flex-col h-full", isSessionsPanelDesktopCollapsed && !isMobile ? "p-2 items-center" : "p-3")}>
        <Button
            className={cn("w-full mb-3 text-sm", isSessionsPanelDesktopCollapsed && !isMobile && "mb-0 aspect-square h-auto p-0")}
            size={isSessionsPanelDesktopCollapsed && !isMobile ? "icon" : "default"}
            onClick={() => startNewIdeaSession(false)}
            aria-label={isSessionsPanelDesktopCollapsed && !isMobile ? "New Idea Session" : undefined}
        >
            <PlusCircle size={isSessionsPanelDesktopCollapsed && !isMobile ? 20 : 16} className={cn(!(isSessionsPanelDesktopCollapsed && !isMobile) && "mr-2")} />
            {!(isSessionsPanelDesktopCollapsed && !isMobile) && "New Idea Session"}
        </Button>
        {!(isSessionsPanelDesktopCollapsed && !isMobile) && (
            <ScrollArea className="flex-1">
              <div className="space-y-1.5 pr-1">
                {savedSessions.filter(s => !s.isArchived).map(session => (
                  <div key={session.id} className="flex items-center group">
                    <Button
                        variant={sessionState.id === session.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left text-xs h-auto py-2 px-2.5 truncate flex-1"
                        onClick={() => loadSessionById(session.id)}
                    >
                        {session.isFavorite && <Star size={12} className="mr-1.5 fill-yellow-400 text-yellow-500 shrink-0"/>}
                        <span className="truncate">{session.name}</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-50 group-hover:opacity-100 focus:opacity-100">
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleFavorite(session.id)}>
                                {session.isFavorite ? <Star size={14} className="mr-2 fill-yellow-400 text-yellow-500"/> : <Star size={14} className="mr-2"/>}
                                {session.isFavorite ? "Unfavorite" : "Favorite"}
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleRenameSession(session.id, session.name)}>
                                <Edit2 size={14} className="mr-2"/>Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleArchive(session.id)}>
                                {session.isArchived ? <ArchiveRestore size={14} className="mr-2"/> : <Archive size={14} className="mr-2"/>}
                                {session.isArchived ? "Unarchive" : "Archive"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() => setDialogSessionId(session.id)}
                                  className="!text-destructive hover:!bg-destructive hover:!text-destructive-foreground focus:!bg-destructive focus:!text-destructive-foreground"
                                >
                                <Trash2 size={14} className="mr-2"/>Delete Session
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                 {savedSessions.filter(s => !s.isArchived).length === 0 && <p className="text-xs text-center text-muted-foreground py-4">No active sessions.</p>}
              </div>
            </ScrollArea>
        )}
      </div>
  );

  if (!isLoaded) {
     return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><Loader2 className="h-10 w-10 text-primary animate-spin"/></div>;
  }

  return (
    <AlertDialog>
      <div className={cn("flex gap-0 md:gap-4 relative", isMobile ? "flex-col" : "")}>
        {!isMobile && (
          <Card className={cn(
              "shadow-lg hidden md:flex flex-col sticky top-24 self-start h-[calc(100vh-8rem-2rem)] transition-all duration-300 ease-in-out",
              isSessionsPanelDesktopCollapsed ? "md:w-16" : "md:w-64"
          )}>
              <CardHeader className={cn("p-3 text-center border-b flex flex-row items-center", isSessionsPanelDesktopCollapsed ? "justify-center" : "justify-between")}>
                  {!isSessionsPanelDesktopCollapsed && (
                      <CardTitle className="text-md font-semibold flex items-center justify-center gap-1.5">
                          <List className="h-5 w-5 text-primary"/> My Idea Sessions
                      </CardTitle>
                  )}
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSessionsPanelDesktopCollapsed(!isSessionsPanelDesktopCollapsed)}
                      className="h-7 w-7"
                      aria-label={isSessionsPanelDesktopCollapsed ? "Expand sessions panel" : "Collapse sessions panel"}
                  >
                      <PanelLeft className={cn("h-5 w-5 transition-transform duration-300", isSessionsPanelDesktopCollapsed && "rotate-180")} />
                  </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                  {sessionsPanelContent}
              </CardContent>
          </Card>
        )}

        {isMobile && (
          <Sheet open={isMobileSessionsPanelOpen} onOpenChange={setIsMobileSessionsPanelOpen}>
              <SheetTrigger asChild>
                  <Button
                      variant="outline"
                      size="icon"
                      className="fixed top-[70px] left-2 z-40 bg-card/90 backdrop-blur-sm text-primary border-primary hover:bg-primary/10 shadow-md"
                      aria-label="Toggle Idea Sessions Panel"
                  >
                      <List className="h-5 w-5" />
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] bg-card flex flex-col">
                  <SheetHeader className="p-3 text-left border-b">
                      <SheetTitle className="text-md font-semibold flex items-center gap-1.5">
                          <List className="h-5 w-5 text-primary"/> My Idea Sessions
                      </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    {sessionsPanelContent}
                  </div>
              </SheetContent>
          </Sheet>
        )}


        <Card className="shadow-lg flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-headline flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-primary animate-pulse-once" />
                AI Idea Igniter 🔥 with Sparky!
              </CardTitle>
              <div className="flex items-center gap-2">
                  <Badge variant="outline" className="ml-auto text-sm hidden sm:block">
                      Mode: {sessionState.chatMode === 'idea_refinement' ? 'Idea Refinement' : 'General Chat'}
                  </Badge>
                  <Dialog>
                      <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label="Help with Sparky">
                              <HelpCircle className="h-5 w-5"/>
                          </Button>
                      </DialogTrigger>
                      <SparkyHelpContentIdeaIgniter />
                  </Dialog>
              </div>
            </div>
            <CardDescription>
              {sessionState.chatMode === 'idea_refinement'
                ? `Let's chat with your AI bestie, Sparky, to shape your vision, ${userName}. Watch the "Idea Spark" meter fill up as your idea gets clearer!`
                : `You're in General Chat mode with Sparky, ${userName}. Ask anything or just chat!`}
              {sessionState.conversation.length > 0 && sessionState.conversation.some(msg => msg.text.includes("picking up from our earlier chat")) && (
                <span className="block mt-1 text-sm text-primary italic">Sparky is continuing your chat from the header!</span>
              )}
              {isMobile && (
                  <Badge variant="outline" className="mt-2 text-sm sm:hidden w-fit">
                      Mode: {sessionState.chatMode === 'idea_refinement' ? 'Idea Refinement' : 'General Chat'}
                  </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-4 bg-muted/30">
            {sessionState.chatMode === 'idea_refinement' && !sessionState.showSnapshot && (
              <div className="mb-4">
                <Progress value={sessionState.ideaClarityScore || 0} className={cn("w-full h-3 transition-all duration-500", getProgressColor(sessionState.ideaClarityScore || 0))} />
                <p className="text-xs text-muted-foreground text-center mt-1">Idea Spark Meter: {Math.round(sessionState.ideaClarityScore || 0)}% Ignited!</p>
              </div>
            )}
            <div className={cn("flex flex-col flex-1 min-h-0 bg-background shadow-inner border rounded-lg", {"h-auto": sessionState.showSnapshot && sessionState.chatMode === 'idea_refinement'})}>
              {!(sessionState.showSnapshot && sessionState.chatMode === 'idea_refinement') ? (
                <>
                  <ScrollArea className="flex-1 p-2 pr-1 md:p-4 md:pr-2" ref={scrollAreaRef}>
                    <div className="space-y-4 p-1 md:p-2">
                      {sessionState.conversation.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-start gap-2 max-w-[85%]",
                            msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                          )}
                        >
                          <Avatar className={cn("h-8 w-8 self-start shrink-0", msg.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                              <AvatarFallback className="text-sm">{msg.sender === 'ai' ? 'AI' : userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                          <div
                            className={cn(
                                "rounded-xl px-3.5 py-2.5 text-sm shadow-md animate-slide-in break-words",
                                msg.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-card text-card-foreground rounded-bl-none border'
                            )}
                            style={{animationDelay: '0.05s', animationFillMode: 'backwards'}}
                          >
                            {msg.text.split('\n').map((line, i) => <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/(\n)/g, '<br/>') }}></p>)}
                          </div>
                        </div>
                      ))}
                      {isLoading && sessionState.conversation.length > 0 && sessionState.conversation[sessionState.conversation.length -1]?.sender === 'user' && (
                        <div className="flex items-start gap-2 justify-start">
                          <Avatar className="h-8 w-8 self-start shrink-0 bg-primary text-primary-foreground">
                              <AvatarFallback className="text-sm">AI</AvatarFallback>
                            </Avatar>
                            <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm shadow bg-card text-card-foreground rounded-bl-none border flex items-center space-x-1">
                              <span className="text-muted-foreground text-xs italic">Sparky is thinking</span>
                            <Loader2 className="h-3 w-3 text-primary animate-spin ml-1" />
                            </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {error && !sessionState.isConversationEnded && (
                    <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
                      <AlertTriangle size={18} /> {error}
                    </div>
                  )}

                  <div className="p-3 border-t bg-background/70">
                    <div className="flex items-center gap-2">
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={
                          sessionState.chatMode === 'idea_refinement' && sessionState.isConversationEnded
                          ? "Idea summarized! Click below to proceed."
                          : sessionState.chatMode === 'idea_refinement'
                            ? "Your thoughts here... or try 'Sparky, remember that [your fact]' or 'switch to general chat'!"
                            : "Chat with Sparky... or type 'switch to idea refinement' to work on your startup vision."
                        }
                        className="flex-1 resize-none bg-card focus-visible:ring-primary p-2.5 border rounded-lg min-h-[44px] max-h-[120px]"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isLoading || (sessionState.isConversationEnded && sessionState.chatMode === 'idea_refinement')}
                      />
                      <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim() || (sessionState.isConversationEnded && sessionState.chatMode === 'idea_refinement')} className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-4">
                        <Send className="h-4 w-4 mr-0 md:mr-2" />
                        <span className="hidden md:inline">Send</span>
                      </Button>
                    </div>
                    {!(sessionState.isConversationEnded && sessionState.chatMode === 'idea_refinement') && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <CornerDownLeft size={12}/> Shift + Enter for new line.
                        {sessionState.chatMode === 'idea_refinement' && " Try 'Sparky, remember: [your fact]' or 'switch to general chat'."}
                        {sessionState.chatMode === 'general_chat' && " Type 'switch to idea refinement' to explore your startup vision."}
                      </p>
                    )}
                  </div>
                </>
              ) : ( // Snapshot View
                <ScrollArea className="flex-1 p-2 md:p-4">
                    <div className="p-1 md:p-2 animate-slide-in space-y-4 text-center">
                    <div className="flex items-center gap-2 justify-center my-2">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                        </Avatar>
                        <p className="max-w-md text-md font-semibold p-3 bg-card border rounded-lg shadow text-primary">
                            {sessionState.conversation.findLast(msg => msg.sender === 'ai')?.text || "Let's see that brilliant idea!"}
                        </p>
                    </div>

                    <Card className="border-primary bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-xl text-left">
                        <CardHeader className="items-center pb-2 pt-4">
                        <CardTitle className="text-xl md:text-2xl font-headline text-primary flex items-center gap-2">
                            <Wand2 size={22} className="animate-pulse-once" />
                            <Textarea
                                value={sessionState.editableSnapshotDetails?.title || ''}
                                onChange={(e) => handleSnapshotDetailChange('title', e.target.value)}
                                placeholder={defaultPlaceholders.title(userName)}
                                className="text-xl md:text-2xl font-headline text-primary bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 m-0 h-auto resize-none leading-tight text-center"
                                rows={1}
                                />
                            <Zap size={22} className="animate-pulse-once"/>
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-3 md:px-4">
                        <EditableField label="Core Summary" value={sessionState.editableSnapshotDetails?.summary} fieldName="summary" placeholder={defaultPlaceholders.summary(userName)} />
                        <EditableField label="Target Audience" value={sessionState.editableSnapshotDetails?.targetAudience} fieldName="targetAudience" placeholder={defaultPlaceholders.targetAudience(userName)}/>
                        <EditableField label="Problem it Solves" value={sessionState.editableSnapshotDetails?.problem} fieldName="problem" placeholder={defaultPlaceholders.problem(userName)}/>
                        <EditableField label="Your Solution" value={sessionState.editableSnapshotDetails?.solution} fieldName="solution" placeholder={defaultPlaceholders.solution(userName)}/>
                        <EditableField label="Unique Angle" value={sessionState.editableSnapshotDetails?.uniqueness} fieldName="uniqueness" placeholder={defaultPlaceholders.uniqueness(userName)}/>
                        <EditableField label="Revenue Model" value={sessionState.editableSnapshotDetails?.revenueModel} fieldName="revenueModel" placeholder={defaultPlaceholders.revenueModel(userName)}/>
                        <EditableField label="Key Roadmap Step" value={sessionState.editableSnapshotDetails?.keyRoadmapStep} fieldName="keyRoadmapStep" placeholder={defaultPlaceholders.keyRoadmapStep(userName)}/>

                        <div className="animate-slide-in" style={{animationDelay: '1.2s'}}>
                            <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-primary">Founder&apos;s Angle:</h4>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-auto py-0.5 px-1.5" onClick={() => toast({title: "Regenerate (Soon!)", description:`Field-specific regeneration for "Founder's Angle" is coming soon!`})}>
                                <RefreshCw size={13} className="mr-1" /> <span className="text-xs">Regen</span>
                                </Button>
                            </div>
                            <Textarea
                                value={sessionState.founderBackground || ''}
                                onChange={(e) => setSessionState(prev => ({...prev, founderBackground: e.target.value}))}
                                placeholder={defaultPlaceholders.founderBackground(userName)}
                                className="text-sm text-muted-foreground bg-background/50 focus-visible:ring-accent"
                                rows={2}
                            />
                        </div>

                        {sessionStorage.getItem(BUSINESS_NAME_KEY) && (
                            <div className="animate-slide-in" style={{animationDelay: '1.4s'}}>
                            <h4 className="font-semibold text-primary">Suggested Name:</h4>
                            <p className="text-muted-foreground text-sm p-2 border rounded-md bg-muted/30">{sessionStorage.getItem(BUSINESS_NAME_KEY)}</p>
                            </div>
                        )}
                        {sessionStorage.getItem(BRAND_TAGLINE_KEY) && (
                            <div className="animate-slide-in" style={{animationDelay: '1.6s'}}>
                            <h4 className="font-semibold text-primary">Suggested Tagline:</h4>
                            <p className="text-muted-foreground text-sm italic p-2 border rounded-md bg-muted/30">"{sessionStorage.getItem(BRAND_TAGLINE_KEY)}"</p>
                            </div>
                        )}
                        </CardContent>
                        <CardFooter className="flex-col items-center gap-3 pt-4">
                        <p className="text-sm text-muted-foreground italic">Feeling good about this, {userName}? Let&apos;s keep the momentum going!</p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                            {sessionState.isFromOnboardingBootstrap && (
                                <Button onClick={handleTalkMoreFromSnapshot} variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                                <MessageSquare className="mr-2 h-5 w-5"/>Let&apos;s Talk More About This
                                </Button>
                            )}
                            <Button
                                onClick={() => proceedToNextStep(sessionState.editableSnapshotDetails as IdeaDetails, true)}
                                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 animate-pulse-once"
                                >
                                Yes, Let&apos;s Go! <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                        </CardFooter>
                    </Card>
                    </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
          {sessionState.rememberedFacts.length > 0 && !sessionState.showSnapshot && (
          <CardFooter className="pt-2 flex-col items-start">
              <Card className="w-full shadow-sm border-primary/20">
                  <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-sm font-semibold flex items-center"><Brain className="mr-2 h-4 w-4 text-primary"/>Sparky's Memory for this Session:</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1 max-h-20 overflow-y-auto">
                      {sessionState.rememberedFacts.map((fact, index) => (
                          <div key={index} className="flex items-start gap-1.5">
                              <span className="font-mono text-primary">&bull;</span>
                              <p className="flex-1">{fact}</p>
                              <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground hover:text-destructive" onClick={() => {
                                  setSessionState(prev => ({...prev, rememberedFacts: prev.rememberedFacts.filter((_, i) => i !== index)}));
                                  toast({title: "Memory Item Removed", description: "Sparky will no longer recall that specific item in this session."});
                              }}>
                                  <Trash2 size={12}/>
                              </Button>
                          </div>
                      ))}
                  </CardContent>
              </Card>
          </CardFooter>
        )}
        </Card>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this idea session and its conversation history.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogSessionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDeleteSession}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
                Yes, delete session
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
