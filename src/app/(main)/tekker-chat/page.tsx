
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { tekkerAssistantChat, type TekkerAssistantOutput, type TekkerAssistantInput } from '@/ai/flows/tekker-assistant-flow';
import { Send, Brain, Loader2, AlertTriangle, Rocket, HardHat, ArrowRight, List, PanelLeft, HelpCircle, MoreVertical, Star, Archive, ArchiveRestore, Edit2, Trash2, PlusCircle, Command, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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

interface TekkerSessionState {
  id: string;
  name: string;
  lastModified: number;
  conversation: ChatMessage[];
  currentPlanSummaryForPlanner?: string | null;
  isFavorite?: boolean;
  isArchived?: boolean;
}

const TEKKER_SESSIONS_LOCAL_KEY = 'heytekTekkerSessions_v1';
const ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY = 'heytekActiveTekkerSessionId_v1';
const HEADER_CHAT_CONTEXT_KEY_FOR_TEKKER = 'headerChatContextForTekkerChat';
const TEKKER_PLAN_FOR_PLANNER_KEY = 'tekkerPlanForPlanner';

// Moved mock data to module level
const moduleLevelMockSpecializations = ['Next.js & ShadCN', 'Genkit Flow Deployment', 'Firebase Integration'];
const moduleLevelMockActiveBuilds = ["Implement 'Zenith' AI Wellness Coach", "Launch 'CreatorConnect' Platform"];


const createTekkerSession = (idSuffix: string = Date.now().toString()): TekkerSessionState => ({
  id: `session_tekker_${idSuffix}`,
  name: `New Tekker Chat - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  lastModified: Date.now(),
  conversation: [],
  currentPlanSummaryForPlanner: null,
  isFavorite: false,
  isArchived: false,
});

const SparkyHelpContentTekkerChat = () => (
  <DialogContent className="sm:max-w-lg bg-card dark:bg-card/95">
    <DialogHeader>
      <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
        <HardHat className="h-6 w-6 animate-pulse-once" />
        Sparky's Tekker Assistant Guide
      </DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Get the most out of your AI Build Strategist, Sparky!
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[60vh] pr-3">
      <div className="space-y-4 py-2 text-sm">
        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Brain size={18} className="text-primary" /> How Sparky Helps Tekkers:</h4>
          <p className="text-muted-foreground">Sparky assists with planning HeyTek 'Builds', understanding specs, troubleshooting, and navigating platform processes. It can even help outline an implementation plan!</p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5"><Command size={18} className="text-primary" /> Key Interactions:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <List size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Plan a Build:</strong> Describe the Build title and its requirements (e.g., "Help me plan 'Project Phoenix', it needs user auth and a dashboard.").
                <p className="text-xs text-muted-foreground">Sparky will ask clarifying questions and can help structure phases and tasks.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <Rocket size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Send to Planner:</strong> If Sparky confirms a plan is ready, you'll see a button to send this summary to the AI Implementation Planner tool for detailed task breakdown.
              </div>
            </li>
             <li className="flex items-start gap-2 p-2 bg-muted/30 dark:bg-muted/15 rounded-md">
              <HelpCircle size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Troubleshooting:</strong> Ask about common issues or best practices for technologies like Genkit, Next.js, Firebase within the HeyTek context.
              </div>
            </li>
          </ul>
        </div>

        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Zap size={18} className="text-primary" /> Tips for Best Results:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4 text-xs">
            <li>Be specific about the Build you're working on.</li>
            <li>Mention key technologies or challenges you anticipate.</li>
            <li>Use this chat for high-level planning; the AI Implementation Planner is for detailed tasks.</li>
          </ul>
        </div>
      </div>
    </ScrollArea>
    <DialogFooter className="pt-4">
      <DialogClose asChild>
        <Button type="button" variant="outline" className="w-full">Let's Tek It!</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
);


export default function TekkerChatPage() {
  const [sessionState, setSessionState] = useState<TekkerSessionState>(createTekkerSession(`initial_${Date.now()}`));
  const [savedSessions, setSavedSessions] = useState<TekkerSessionState[]>([]);
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
  const { user } = useAuth();
  const userName = user?.username || user?.email?.split('@')[0] || 'Tekker';
  const isMobile = useIsMobile();

  const hasProcessedHeaderContext = useRef(false);
  const initializingSession = useRef(false);


  const saveTekkerSessionsToLocalStorage = useCallback((sessionsToSave: TekkerSessionState[], activeIdToSave?: string) => {
    try {
      localStorage.setItem(TEKKER_SESSIONS_LOCAL_KEY, JSON.stringify(sessionsToSave));
      if (activeIdToSave) {
        localStorage.setItem(ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY, activeIdToSave);
      }
    } catch (e) {
      console.warn("Could not save Tekker sessions to localStorage:", e);
      toast({ title: "Storage Error", description: "Could not save Tekker chat sessions.", variant: "destructive"});
    }
  }, [toast]);

  const saveCurrentTekkerSessionDetails = useCallback(() => {
    if (sessionState.id.startsWith('session_tekker_initial_') || sessionState.id.startsWith('session_tekker_placeholder_')) return;

    setSavedSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionState.id);
      let updatedName = sessionState.name;
       if (sessionState.name.startsWith("New Tekker Chat") && sessionState.conversation.length > 1) {
         const firstUserMessage = sessionState.conversation.find(m => m.sender === 'user');
         if (firstUserMessage) {
            updatedName = firstUserMessage.text.substring(0, 30) + "...";
         }
      }
      const updatedSession = { ...sessionState, lastModified: Date.now(), name: updatedName };
      let newSessions;
      if (existingIndex > -1) {
        newSessions = [...prevSessions];
        newSessions[existingIndex] = updatedSession;
      } else {
        newSessions = [updatedSession, ...prevSessions];
      }
      const sortedSessions = newSessions.sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified);
      saveTekkerSessionsToLocalStorage(sortedSessions, sessionState.id);
      return sortedSessions;
    });
  }, [sessionState, saveTekkerSessionsToLocalStorage]);


  const makeInitialTekkerAICall = useCallback(async (targetSession: TekkerSessionState) => {
      if (initializingSession.current || targetSession.conversation.length > 0) return;
      initializingSession.current = true;
      setIsLoading(true);
      setError(null);
      try {
          const result = await tekkerAssistantChat({
              userInput: "Hello Sparky, I'm here for some Tekker assistance.",
              chatHistory: "",
              tekkerContext: { userName, mockActiveBuilds: moduleLevelMockActiveBuilds, mockSpecializations: moduleLevelMockSpecializations }
          });
          const aiMessage: ChatMessage = { id: Date.now().toString(), text: result.aiResponse, sender: 'ai' };

          setSessionState(prev => ({
            ...targetSession,
            conversation: [aiMessage],
            currentPlanSummaryForPlanner: result.planSummary || null,
            lastModified: Date.now(),
          }));

      } catch (err) {
          console.error('Error making initial Tekker AI call:', err);
          setError(`Sparky couldn't connect. Please try refreshing or select another session.`);
          setSessionState(prev => ({...prev, conversation: [{id: 'err-init-tekker', text: 'Error starting chat.', sender: 'ai'}]}));
      } finally {
          setIsLoading(false);
          initializingSession.current = false;
      }
  }, [userName]);


  const loadTekkerSessionById = useCallback((sessionId: string) => {
    if (sessionState.id === sessionId && !initializingSession.current) return;
    const sessionToLoad = savedSessions.find(s => s.id === sessionId);
    if (sessionToLoad) {
      if (!sessionState.id.startsWith('session_tekker_initial_') && !sessionState.id.startsWith('session_tekker_placeholder_')) saveCurrentTekkerSessionDetails();
      setSessionState(sessionToLoad);
      localStorage.setItem(ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY, sessionId);
      toast({ title: "Session Loaded", description: `Switched to "${sessionToLoad.name}".` });
      if (isMobile) setIsMobileSessionsPanelOpen(false);
      if (sessionToLoad.conversation.length === 0) {
         makeInitialTekkerAICall(sessionToLoad);
      }
    } else {
      toast({ title: "Error", description: "Could not find Tekker session to load.", variant: "destructive" });
    }
  }, [savedSessions, toast, makeInitialTekkerAICall, saveCurrentTekkerSessionDetails, sessionState.id, isMobile]);


  const startNewTekkerSession = useCallback((isFirstSessionEver = false) => {
    if (initializingSession.current) return;
    if (!isFirstSessionEver && !sessionState.id.startsWith('session_tekker_initial_') && !sessionState.id.startsWith('session_tekker_placeholder_')) {
        saveCurrentTekkerSessionDetails();
    }
    const newSession = createTekkerSession();
    setSessionState(newSession);
    setSavedSessions(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)].sort((a,b)=> (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.lastModified - a.lastModified));
    localStorage.setItem(ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY, newSession.id);
    makeInitialTekkerAICall(newSession);
    if (isMobile) setIsMobileSessionsPanelOpen(false);
  }, [saveCurrentTekkerSessionDetails, makeInitialTekkerAICall, sessionState.id, isMobile]);


  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      const storedSessionsString = localStorage.getItem(TEKKER_SESSIONS_LOCAL_KEY);
      let loadedSessions: TekkerSessionState[] = [];
      if (storedSessionsString) {
          try {
              loadedSessions = JSON.parse(storedSessionsString).sort((a: TekkerSessionState, b: TekkerSessionState) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1: 0) || b.lastModified - a.lastModified);
              setSavedSessions(loadedSessions);
          } catch (e) { console.warn("Could not parse saved Tekker sessions", e); }
      }
      const activeId = localStorage.getItem(ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY);
      const sessionToLoad = loadedSessions.find(s => s.id === activeId);

      if (sessionToLoad) {
        setSessionState(sessionToLoad);
      } else if (loadedSessions.length > 0) {
        setSessionState(loadedSessions[0]);
        localStorage.setItem(ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY, loadedSessions[0].id);
      } else {
        setSessionState(createTekkerSession(`placeholder_${Date.now()}`)); // Placeholder to avoid immediate save
      }
      setIsLoaded(true);
    }
  }, [isLoaded]);


  useEffect(() => {
    if (!isLoaded || initializingSession.current) return;

    if (!hasProcessedHeaderContext.current) {
        const headerContextString = sessionStorage.getItem(HEADER_CHAT_CONTEXT_KEY_FOR_TEKKER);
        if (headerContextString) {
            sessionStorage.removeItem(HEADER_CHAT_CONTEXT_KEY_FOR_TEKKER);
            hasProcessedHeaderContext.current = true;
            initializingSession.current = true;

            try {
                const headerMessages: ChatMessage[] = JSON.parse(headerContextString);
                if (headerMessages.length > 0) {
                    const newSessionFromHeader = createTekkerSession(`header_${Date.now()}`);
                    newSessionFromHeader.name = headerMessages.find(m => m.sender === 'user')?.text.substring(0, 30) + "..." || newSessionFromHeader.name;
                    setSessionState(newSessionFromHeader);
                    setIsLoading(true);

                    tekkerAssistantChat({
                        userInput: '',
                        chatHistory: formatChatHistory(headerMessages),
                        tekkerContext: { userName, mockActiveBuilds: moduleLevelMockActiveBuilds, mockSpecializations: moduleLevelMockSpecializations }
                    }).then(result => {
                        const aiResponseMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: result.aiResponse, sender: 'ai' };
                        const finalConversation = [...headerMessages, aiResponseMsg];

                        const fullyInitializedSession = {
                            ...newSessionFromHeader,
                            conversation: finalConversation,
                            currentPlanSummaryForPlanner: result.planSummary || null,
                            lastModified: Date.now(),
                        };
                        setSessionState(fullyInitializedSession);
                        setSavedSessions(prev => [fullyInitializedSession, ...prev.filter(s => s.id !== fullyInitializedSession.id)].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.lastModified - a.lastModified));
                        localStorage.setItem(ACTIVE_TEKKER_SESSION_ID_LOCAL_KEY, fullyInitializedSession.id);
                        toast({ title: "Switched to Tekker Assistant!", description: "Continuing your thoughts from the header chat.", icon: <HardHat /> });
                    }).catch(err => {
                        console.error("Error initializing Tekker chat from header:", err);
                        startNewTekkerSession(true);
                    }).finally(() => {
                        setIsLoading(false);
                        initializingSession.current = false;
                    });
                    return;
                }
            } catch (e) {
              console.error("Error processing Tekker header context:", e);
              initializingSession.current = false;
            }
            hasProcessedHeaderContext.current = true; // Mark as processed even if context was empty/invalid
        }
    }
    
    if (sessionState.id.startsWith('session_tekker_placeholder_') && !hasProcessedHeaderContext.current ) {
        if (savedSessions.length > 0) {
            loadTekkerSessionById(savedSessions[0].id);
        } else {
            startNewTekkerSession(true);
        }
    } else if (sessionState.conversation.length === 0) {
        makeInitialTekkerAICall(sessionState);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userName]); // Simplified dependencies for initial setup


  useEffect(() => {
    if (isLoaded && !sessionState.id.startsWith('session_tekker_placeholder_') && sessionState.id !== `session_tekker_initial_${sessionState.id.split('_')[2]}`) { // Check against dynamic initial ID pattern
        saveCurrentTekkerSessionDetails();
    }
  }, [sessionState, saveCurrentTekkerSessionDetails, isLoaded]);


  const formatChatHistory = (chatMessages: ChatMessage[]): string => {
    return chatMessages.slice(-7).map(msg => `${msg.sender === 'ai' ? 'AI' : 'User'}: ${msg.text}`).join('\n');
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const currentInput = userInput;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), text: currentInput, sender: 'user' };

    setSessionState(prev => ({
        ...prev,
        conversation: [...prev.conversation, newUserMessage],
        currentPlanSummaryForPlanner: null
    }));
    setUserInput('');
    setIsLoading(true);
    setError(null);

    const conversationForHistory = [...sessionState.conversation, newUserMessage];
    const chatHistoryForAI = formatChatHistory(conversationForHistory);

    try {
      const result: TekkerAssistantOutput = await tekkerAssistantChat({
        userInput: currentInput,
        chatHistory: chatHistoryForAI,
        tekkerContext: { userName, mockActiveBuilds: moduleLevelMockActiveBuilds, mockSpecializations: moduleLevelMockSpecializations }
      });

      const aiResponseMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: result.aiResponse, sender: 'ai' };
      setSessionState(prev => ({
        ...prev,
        conversation: [...prev.conversation, aiResponseMsg],
        currentPlanSummaryForPlanner: result.planSummary || null
      }));

      if (result.isPlanReadyForPlanner && result.planSummary) {
        toast({
          title: "Plan Ready!",
          description: "Sparky has summarized a plan. You can send it to the AI Implementation Planner.",
          icon: <Rocket className="h-5 w-5 text-primary" />
        });
      }

    } catch (err) {
      console.error('Error interacting with Tekker AI assistant:', err);
      setError('Oops! Sparky had a hiccup. Please try sending your message again.');
      const errorMsg: ChatMessage = { id: 'err-' + Date.now(), text: "Sorry, I couldn't process that. Please try again.", sender: 'ai' };
      setSessionState(prev => ({...prev, conversation: [...prev.conversation, errorMsg]}));
      toast({ title: "AI Error", description: "Sparky had a glitch. Please try your message again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [sessionState.conversation]);

  const handleSendToPlanner = () => {
    if (sessionState.currentPlanSummaryForPlanner) {
      sessionStorage.setItem(TEKKER_PLAN_FOR_PLANNER_KEY, sessionState.currentPlanSummaryForPlanner);
      toast({
        title: "Plan Sent!",
        description: "Redirecting you to the AI Implementation Planner with the plan details...",
        icon: <ArrowRight className="h-5 w-5 text-primary" />
      });
      router.push('/implementation-planner');
    }
  };

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
    saveTekkerSessionsToLocalStorage(updatedSessions, updatedSessions.length > 0 ? updatedSessions[0].id : undefined);

    toast({ title: "Session Deleted", description: `"${sessionToDelete.name}" has been removed.` });

    if (sessionState.id === dialogSessionId) {
      if (updatedSessions.length > 0) {
        loadTekkerSessionById(updatedSessions[0].id);
      } else {
        startNewTekkerSession(true);
      }
    }
    setDialogSessionId(null);
  };

  const sessionsPanelContent = (
    <div className={cn("flex flex-col h-full", isSessionsPanelDesktopCollapsed && !isMobile ? "p-2 items-center" : "p-3")}>
      <Button
          className={cn("w-full mb-3 text-sm", isSessionsPanelDesktopCollapsed && !isMobile && "mb-0 aspect-square h-auto p-0")}
          size={isSessionsPanelDesktopCollapsed && !isMobile ? "icon" : "default"}
          onClick={() => startNewTekkerSession(false)}
          aria-label={isSessionsPanelDesktopCollapsed && !isMobile ? "New Tekker Session" : undefined}
      >
          <PlusCircle size={isSessionsPanelDesktopCollapsed && !isMobile ? 20 : 16} className={cn(!(isSessionsPanelDesktopCollapsed && !isMobile) && "mr-2")} />
          {!(isSessionsPanelDesktopCollapsed && !isMobile) && "New Tekker Session"}
      </Button>
      {!(isSessionsPanelDesktopCollapsed && !isMobile) && (
          <ScrollArea className="flex-1">
            <div className="space-y-1.5 pr-1">
              {savedSessions.filter(s => !s.isArchived).map(session => (
                <div key={session.id} className="flex items-center group">
                  <Button
                      variant={sessionState.id === session.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left text-xs h-auto py-2 px-2.5 truncate flex-1"
                      onClick={() => loadTekkerSessionById(session.id)}
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
                                onSelect={(e) => e.preventDefault()}
                                className="!text-destructive hover:!bg-destructive hover:!text-destructive-foreground focus:!bg-destructive focus:!text-destructive-foreground"
                                onClick={() => setDialogSessionId(session.id)}
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
                          <List className="h-5 w-5 text-primary"/> My Tekker Chats
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
                    aria-label="Toggle Tekker Sessions Panel"
                >
                    <List className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] bg-card flex flex-col">
                <SheetHeader className="p-3 text-left border-b">
                    <SheetTitle className="text-md font-semibold flex items-center gap-1.5">
                        <List className="h-5 w-5 text-primary"/> My Tekker Chats
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
                <HardHat className="mr-2 h-7 w-7 text-primary" />
                Tekker Chat Assistant with Sparky
              </CardTitle>
              <Dialog>
                  <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" aria-label="Help with Tekker Chat">
                          <HelpCircle className="h-5 w-5"/>
                      </Button>
                  </DialogTrigger>
                  <SparkyHelpContentTekkerChat />
              </Dialog>
            </div>
            <CardDescription>
              Hi {userName}! I'm here to help you plan your Builds, troubleshoot, and strategize.
              Your mock specializations: {moduleLevelMockSpecializations.join(', ')}.
              You're (mock) working on: {moduleLevelMockActiveBuilds.join('; ')}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-4 bg-muted/30">
            <ScrollArea className="flex-1 mb-0 p-2 pr-1 border rounded-md bg-background shadow-inner" ref={scrollAreaRef}>
              <div className="space-y-4 p-2">
                {sessionState.conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-start gap-2 max-w-[85%]", // Use items-start for better alignment with avatar
                      msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    )}
                  >
                    <Avatar className={cn("h-8 w-8 self-start shrink-0", msg.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                      <AvatarFallback className="text-sm">{msg.sender === 'ai' ? 'S' : userName[0]?.toUpperCase() || 'T'}</AvatarFallback>
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
                  <div className="flex items-start gap-2 justify-start"> {/* Use items-start */}
                    <Avatar className="h-8 w-8 self-start shrink-0 bg-primary text-primary-foreground"><AvatarFallback className="text-sm">S</AvatarFallback></Avatar>
                    <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm shadow bg-card text-card-foreground rounded-bl-none border flex items-center space-x-1">
                      <span className="text-muted-foreground text-xs italic">Sparky is thinking...</span>
                      <Loader2 className="h-3 w-3 text-primary animate-spin ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {error && (
              <div className="mt-2 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-center gap-2">
                <AlertTriangle size={18} /> {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t bg-background/70 flex flex-col items-stretch gap-3">
              {sessionState.currentPlanSummaryForPlanner && (
                  <div className="w-full p-3 border border-dashed border-primary rounded-md bg-primary/5 text-center">
                      <p className="text-sm text-primary mb-2">Sparky has outlined a plan! Send it to the AI Implementation Planner?</p>
                      <Button onClick={handleSendToPlanner} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          <Rocket className="mr-2 h-4 w-4" /> Send to Planner
                      </Button>
                  </div>
              )}
              <div className="flex items-center gap-2 w-full">
              <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about your Builds, HeyTek processes, or technical challenges..."
                  className="flex-1 resize-none bg-card focus-visible:ring-primary p-2.5 border rounded-lg min-h-[44px] max-h-[120px]"
                  rows={1}
                  onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                  }
                  }}
                  disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-4">
                  <Send className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Send</span>
              </Button>
              </div>
          </CardFooter>
        </Card>

        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this chat session and its conversation history.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogSessionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDeleteSession}
                className="!text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
                Yes, delete session
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
