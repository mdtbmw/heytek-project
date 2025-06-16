
'use client';

import { AppLogo } from './AppLogo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, UserCircle, BookOpen, LifeBuoy, Info, Search, Send, MessageSquare, Bot, Sparkles as SparklesIcon, X, Loader2, Eye, TrendingUp, HardHat, HelpCircle as HelpCircleIcon, CheckCircle, Command, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/onboarding/ThemeToggle';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allNavItems, type NavItem } from '@/lib/navigationItems';
import { generalChat, type GeneralChatOutput } from '@/ai/flows/general-chat-flow';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';


const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
const HEADER_CHAT_CONTEXT_KEY_FOR_IDEA_IGNITER = 'headerChatContextForIdeaExtractor';
const HEADER_CHAT_CONTEXT_KEY_FOR_TEKKER = 'headerChatContextForTekkerChat';
const STARTUP_FOR_DILIGENCE_KEY = 'startupForDueDiligence';


interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  suggestion?: 'switchToIdeaMode' | 'switchToTekkerChat' | 'switchToDueDiligence';
  suggestedStartups?: GeneralChatOutput['suggestedStartups'];
}

const SparkyHelpContentHeader = () => (
  <DialogContent className="sm:max-w-lg bg-card dark:bg-card/95">
    <DialogHeader>
      <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
        <SparklesIcon className="h-6 w-6 animate-pulse-once" />
        Sparky's Quick Search & Chat Guide
      </DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Your AI assistant in the header can help you find tools and get quick answers.
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[60vh] pr-3">
      <div className="space-y-4 py-2 text-sm">
        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Search size={18} className="text-primary" /> Finding Tools:</h4>
          <p className="text-muted-foreground">Simply type keywords (e.g., "brand", "legal", "pitch deck") into the search bar. Relevant tools will appear as suggestions.</p>
          <p className="text-xs text-muted-foreground mt-1">Shortcut: Press <Command size={12} className="inline-block" />K (or Ctrl+K) to quickly focus the search.</p>
        </div>

        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><MessageSquare size={18} className="text-primary" /> Chatting with Sparky:</h4>
          <p className="text-muted-foreground">If no tools match your search, or if you just want to ask a question, type your query and press Enter. Sparky will try to help based on your current role in HeyTek.</p>
        </div>

        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><ExternalLink size={18} className="text-primary" /> Smart Tool Suggestions:</h4>
          <p className="text-muted-foreground">While chatting, Sparky might understand that your query is best handled by a specialized tool. For example:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4 text-xs mt-1">
            <li>If you're a <strong className="text-foreground">Founder</strong> discussing a new idea, Sparky may suggest switching to the <strong className="text-foreground">Idea Igniter</strong>.</li>
            <li>If you're a <strong className="text-foreground">Tekker</strong> planning a build, Sparky might guide you to the <strong className="text-foreground">Tekker Assistant</strong> or <strong className="text-foreground">AI Planner</strong>.</li>
            <li>If you're an <strong className="text-foreground">Investor</strong> asking about evaluating startups, Sparky could suggest the <strong className="text-foreground">Due Diligence Question Generator</strong>.</li>
          </ul>
          <p className="text-muted-foreground text-xs mt-1">You'll get a prompt to switch, and your chat context can often be carried over!</p>
        </div>

        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Bot size={18} className="text-primary" /> Sparky's Aim:</h4>
          <p className="text-muted-foreground">To be your helpful co-pilot, guiding you to the right resources and tools within HeyTek to accelerate your journey!</p>
        </div>
      </div>
    </ScrollArea>
    <DialogFooter className="pt-4">
      <DialogClose asChild>
        <Button type="button" variant="outline" className="w-full">Awesome, thanks Sparky!</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
);


export function Header() {
  const { user, logout, onboardingData, isFounderInvestor } = useAuth();
  const { isMobile, state: sidebarDesktopState, openMobile: sidebarMobileOpen } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [toolSuggestions, setToolSuggestions] = useState<NavItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatPopoverOpen, setIsChatPopoverOpen] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  const [showModeSwitchSuggestion, setShowModeSwitchSuggestion] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'switchToIdeaMode' | 'switchToTekkerChat' | 'switchToDueDiligence' | null>(null);
  const [selectedStartupForDiligence, setSelectedStartupForDiligence] = useState<GeneralChatOutput['suggestedStartups'] extends (infer U)[] ? U : never | null>(null);
  
  const [chatInput, setChatInput] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = user?.username || user?.email?.split('@')[0] || 'User';


  const fullPlaceholderText = "Search tools or type & press Enter to ask Sparky (⌘K)";
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(fullPlaceholderText);
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTickerIndexRef = useRef(0);

  const startTypewriter = useCallback(() => {
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    setIsTypewriterDone(false);
    setAnimatedPlaceholder("");
    let i = 0;
    typewriterIntervalRef.current = setInterval(() => {
      if (i < fullPlaceholderText.length) {
        setAnimatedPlaceholder(prev => prev + fullPlaceholderText.charAt(i));
        i++;
      } else {
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
        setIsTypewriterDone(true);
      }
    }, 50);
  }, [fullPlaceholderText]);

  const startTicker = useCallback(() => {
    if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    const tickerText = `${fullPlaceholderText} ::: ${fullPlaceholderText} ::: `;
    const textLength = fullPlaceholderText.length + 5; 

    tickerIntervalRef.current = setInterval(() => {
        currentTickerIndexRef.current = (currentTickerIndexRef.current + 1) % textLength;
        const start = currentTickerIndexRef.current;
        const visibleText = (tickerText + tickerText).substring(start, start + fullPlaceholderText.length);
        setAnimatedPlaceholder(visibleText);
    }, 200);
  }, [fullPlaceholderText]);


  useEffect(() => {
    if (!searchInputRef.current || document.activeElement !== searchInputRef.current) {
        startTypewriter();
    }
    return () => {
      if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (isTypewriterDone && (!searchInputRef.current || document.activeElement !== searchInputRef.current)) {
        startTicker();
    }
    return () => {
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    };
  }, [isTypewriterDone, startTicker]);


  const handleSearchFocus = () => {
    setIsChatPopoverOpen(true);
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    setAnimatedPlaceholder(fullPlaceholderText); 
  };

  const handleSearchBlur = () => {
    if (!searchQuery && (!chatInputRef.current || document.activeElement !== chatInputRef.current) && !isChatPopoverOpen) { 
        currentTickerIndexRef.current = 0;
        startTypewriter();
    }
  };


  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length -1]) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const showHeaderSidebarTrigger = isMobile || (!isMobile && sidebarDesktopState === 'expanded');
  const showHeaderLogo = (!isMobile && sidebarDesktopState === 'collapsed') || (isMobile && !sidebarMobileOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0 && chatMessages.length === 0) {
      const filtered = allNavItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
      ).filter(item => !item.roles || item.roles.includes(user?.primaryRole || 'other'));
      setToolSuggestions(filtered.slice(0, 5));
      if (searchQuery.trim()) setIsChatPopoverOpen(true);
    } else {
      setToolSuggestions([]);
    }
  }, [searchQuery, user?.primaryRole, chatMessages.length]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTo({ top: chatScrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  const getCurrentStartupName = useCallback((): string | undefined => {
    if (user?.primaryRole === 'founder_ceo' && onboardingData?.founderSetup?.companyName) {
      return onboardingData.founderSetup.companyName;
    }
    const ideaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    if (ideaDetailsString) {
      try {
        const idea: { title?: string } = JSON.parse(ideaDetailsString);
        if (idea.title && !idea.title.startsWith("A Sparkling New Vision") && !idea.title.startsWith("Sparkling New Idea")) {
          return idea.title;
        }
      } catch (e) { console.error("Error parsing idea details for name in Header", e); }
    }
    return undefined;
  }, [user?.primaryRole, onboardingData?.founderSetup?.companyName]);


  const processAIChatResponse = (result: GeneralChatOutput, currentMessages: ChatMessage[]) => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.aiResponse,
        sender: 'ai',
        suggestedStartups: result.suggestedStartups
      };
      setChatMessages([...currentMessages, aiMessage]);

      if (result.suggestSwitchToIdeaMode && user?.primaryRole === 'founder_ceo') {
        setShowModeSwitchSuggestion(true);
        setSuggestionType('switchToIdeaMode');
      } else if (result.suggestSwitchToTekkerChat && user?.primaryRole === 'tekker') {
        setShowModeSwitchSuggestion(true);
        setSuggestionType('switchToTekkerChat');
      } else if (result.promptSwitchToDueDiligence && user?.primaryRole === 'investor') {
        setShowModeSwitchSuggestion(true);
        setSuggestionType('switchToDueDiligence');
      }
  };

  const initiateAiChat = async (initialQuery: string) => {
    setSearchQuery('');
    setToolSuggestions([]);
    setIsChatPopoverOpen(true); 

    const userMessage: ChatMessage = { id: Date.now().toString(), text: initialQuery, sender: 'user' };
    setChatMessages([userMessage]);
    setIsAiResponding(true);
    setShowModeSwitchSuggestion(false);
    setSuggestionType(null);
    setSelectedStartupForDiligence(null);
    setChatInput('');

    try {
      const startupName = getCurrentStartupName();
      const result = await generalChat({
        userInput: initialQuery,
        chatHistory: "", 
        userRole: user?.primaryRole || 'other',
        userName: userName,
        currentStartupName: startupName,
      });
      processAIChatResponse(result, [userMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      setChatMessages(prev => [...prev, { id: 'err-' + Date.now(), text: "Sorry, Sparky is a bit tangled up. Try again?", sender: 'ai'}]);
    } finally {
      setIsAiResponding(false);
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };

  const handleChatPopoverSubmit = async () => {
    if (!chatInput.trim()) return;
    const currentChatInputValue = chatInput;
    setChatInput('');

    const userMessage: ChatMessage = { id: Date.now().toString(), text: currentChatInputValue, sender: 'user' };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setIsAiResponding(true);
    setShowModeSwitchSuggestion(false);
    setSuggestionType(null);
    
    try {
      const history = chatMessages.slice(-5).map(m => `${m.sender === 'ai' ? 'AI' : 'User'}: ${m.text}`).join('\n');
      const startupName = getCurrentStartupName();
      const result = await generalChat({
        userInput: currentChatInputValue,
        chatHistory: history,
        userRole: user?.primaryRole || 'other',
        userName: userName,
        currentStartupName: startupName,
      });
      processAIChatResponse(result, updatedMessages);
    } catch (error) {
      console.error("AI chat error:", error);
      setChatMessages(prev => [...prev, { id: 'err-' + Date.now(), text: "Sparky had a moment. Please try again.", sender: 'ai'}]);
    } finally {
      setIsAiResponding(false);
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };
  
  const handleAnalyzeStartup = (startup: GeneralChatOutput['suggestedStartups'] extends (infer U)[] ? U : never) => {
    setSelectedStartupForDiligence(startup);
    setShowModeSwitchSuggestion(true); 
    setSuggestionType('switchToDueDiligence'); 
    const analyzeMessage = `Okay, let's look closer at ${startup.name}.`;
    const userMessage: ChatMessage = { id: Date.now().toString(), text: analyzeMessage, sender: 'user' };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setIsAiResponding(true);
    
    const history = chatMessages.slice(-5).map(m => `${m.sender === 'ai' ? 'AI' : 'User'}: ${m.text}`).join('\n');
    generalChat({
        userInput: analyzeMessage,
        chatHistory: history,
        userRole: user?.primaryRole || 'other',
        userName: userName,
    }).then(result => {
        processAIChatResponse(result, updatedMessages);
    }).catch(error => {
        console.error("AI chat error:", error);
        setChatMessages(prev => [...prev, { id: 'err-' + Date.now(), text: "Sparky had a moment. Please try again.", sender: 'ai'}]);
    }).finally(() => {
        setIsAiResponding(false);
        setTimeout(() => chatInputRef.current?.focus(), 100);
    });
  };


  const handleSwitchMode = () => {
    let targetPath = '';
    let contextKey = '';
    let toastTitle = '';
    let toastDescription = '';
    let toastIcon = <SparklesIcon className="h-5 w-5 text-primary" />;

    if (suggestionType === 'switchToIdeaMode') {
      targetPath = '/idea-extractor';
      contextKey = HEADER_CHAT_CONTEXT_KEY_FOR_IDEA_IGNITER;
      toastTitle = "Switching to Idea Igniter!";
      toastDescription = "Bringing your current thoughts over...";
    } else if (suggestionType === 'switchToTekkerChat') {
      targetPath = '/tekker-chat';
      contextKey = HEADER_CHAT_CONTEXT_KEY_FOR_TEKKER;
      toastTitle = "Switching to Tekker Assistant!";
      toastDescription = "Opening dedicated chat for detailed planning...";
      toastIcon = <HardHat className="h-5 w-5 text-primary" />;
    } else if (suggestionType === 'switchToDueDiligence') {
      targetPath = '/due-diligence-questions';
      if (selectedStartupForDiligence) {
        sessionStorage.setItem(STARTUP_FOR_DILIGENCE_KEY, JSON.stringify(selectedStartupForDiligence));
        toastTitle = `Analyzing ${selectedStartupForDiligence.name}!`;
        toastDescription = "Transferring details to Due Diligence tool...";
      } else {
        toastTitle = "Switching to Due Diligence Tool!";
        toastDescription = "You can input startup details there.";
      }
      toastIcon = <HelpCircleIcon className="h-5 w-5 text-primary" />;
    }

    if (targetPath) {
      if (contextKey && (suggestionType === 'switchToIdeaMode' || suggestionType === 'switchToTekkerChat')) {
        sessionStorage.setItem(contextKey, JSON.stringify(chatMessages));
      }
      toast({ title: toastTitle, description: toastDescription, icon: toastIcon });
      router.push(targetPath);
    }

    setIsChatPopoverOpen(false);
    setChatMessages([]);
    setShowModeSwitchSuggestion(false);
    setSuggestionType(null);
    setSelectedStartupForDiligence(null);
    setSearchQuery('');
  };

  const handleKeepChatting = () => {
    setShowModeSwitchSuggestion(false);
    setSuggestionType(null);
    setSelectedStartupForDiligence(null); 
    setTimeout(() => chatInputRef.current?.focus(), 0);
  };

  const handleClosePopover = () => {
    setIsChatPopoverOpen(false);
     if (!searchQuery && !chatInputRef.current) { 
      startTypewriter();
    }
  };

  const showAskSparkyButton = searchQuery.trim() && toolSuggestions.length === 0 && chatMessages.length === 0 && !isAiResponding;

  const renderSuggestionButtons = () => {
    if (!showModeSwitchSuggestion) return null;
    
    let yesButtonText = "Yes, Switch Mode";
    let suggestionMessage = "Sparky recommends switching context. Proceed?";

    if (suggestionType === 'switchToIdeaMode') {
        yesButtonText = "Yes, Refine Idea";
        suggestionMessage = "Sparky thinks this is an idea! Ready to refine it in the Idea Igniter?";
    } else if (suggestionType === 'switchToTekkerChat') {
        yesButtonText = "Yes, Open Tekker Chat";
        suggestionMessage = "Need detailed planning? Switch to the dedicated Tekker Assistant?";
    } else if (suggestionType === 'switchToDueDiligence') {
        yesButtonText = selectedStartupForDiligence ? `Yes, Analyze ${selectedStartupForDiligence.name}` : "Yes, Open Due Diligence Tool";
        suggestionMessage = selectedStartupForDiligence 
            ? `Ready to generate due diligence questions for ${selectedStartupForDiligence.name}?`
            : "The AI Due Diligence Question Generator can help. Switch to that tool?";
    }


    return (
        <div className="p-3 border-t border-border bg-accent/10 dark:bg-accent/20">
            <p className="text-sm text-accent-foreground dark:text-accent-foreground/90 mb-2">{suggestionMessage}</p>
            <div className="flex gap-2">
            <Button size="sm" onClick={handleSwitchMode} className="bg-primary hover:bg-primary/80 text-primary-foreground">{yesButtonText}</Button>
            <Button size="sm" variant="outline" onClick={handleKeepChatting} className="bg-background hover:bg-muted">No, Keep Chatting Here</Button>
            </div>
        </div>
    );
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm dark:bg-background/90">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {showHeaderSidebarTrigger && (
            <SidebarTrigger
              className="h-8 w-8 text-foreground hover:bg-accent hover:text-accent-foreground"
            />
          )}
          {showHeaderLogo && (
            <div className={cn(isMobile && sidebarMobileOpen ? 'hidden' : 'hidden md:block')}>
              <AppLogo />
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center px-4">
          <Popover open={isChatPopoverOpen} onOpenChange={setIsChatPopoverOpen}>
            <PopoverAnchor asChild>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder={animatedPlaceholder}
                  className="w-full pl-10 pr-10 py-2 h-10 bg-muted/50 dark:bg-input border-border focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      e.preventDefault();
                      if (toolSuggestions.length === 0 && chatMessages.length === 0) {
                        initiateAiChat(searchQuery);
                      }
                    }
                  }}
                />
                 {isChatPopoverOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleClosePopover}
                        aria-label="Close search popover"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
              </div>
            </PopoverAnchor>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-[500px] max-w-xl p-0 search-chat-popover-content mt-1"
              align="center"
              onOpenAutoFocus={(e) => {
                if (chatMessages.length > 0 && chatInputRef.current) {
                  chatInputRef.current.focus();
                } else if (searchInputRef.current && !isChatPopoverOpen) {
                    // If popover auto-opens due to typing, keep focus on search input
                    searchInputRef.current.focus();
                } else {
                    e.preventDefault(); 
                }
              }}
               onInteractOutside={(e) => {
                 if ((e.target as HTMLElement)?.closest('.search-chat-popover-content') || (e.target as HTMLElement) === searchInputRef.current || (e.target as HTMLElement)?.closest('[data-radix-popper-content-wrapper]')) { 
                   return; 
                 }
                 setIsChatPopoverOpen(false);
                  if (!searchQuery) { 
                    startTypewriter();
                  }
               }}
            >
              {chatMessages.length > 0 ? (
                 <div className="flex flex-col h-[clamp(250px,60vh,450px)]">
                    <div className="p-2 border-b border-border flex justify-between items-center">
                        <p className="text-xs font-medium text-muted-foreground">Chat with Sparky</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" aria-label="Sparky Chat Help">
                                    <HelpCircleIcon className="h-4 w-4"/>
                                </Button>
                            </DialogTrigger>
                            <SparkyHelpContentHeader />
                        </Dialog>
                    </div>
                  <ScrollArea className="flex-1 p-3 space-y-3" ref={chatScrollAreaRef}>
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={cn("flex items-start gap-2 max-w-[85%]", msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                        <Avatar className={cn("h-6 w-6 text-xs", msg.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background')}>
                           <AvatarFallback>{msg.sender === 'ai' ? <Bot size={14}/> : getInitials(userName)}</AvatarFallback>
                        </Avatar>
                        <div className={cn("p-2 rounded-lg text-sm shadow-sm chat-bubble", msg.sender === 'user' ? 'chat-bubble-user rounded-br-none' : 'chat-bubble-ai rounded-bl-none')}>
                          {msg.text.split('\n').map((line, i) => <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/(\r\n|\n|\r)/gm, '<br/>') }}></p>)}
                          {msg.sender === 'ai' && msg.suggestedStartups && msg.suggestedStartups.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground">Sparky found these HeyTek startups:</p>
                                {msg.suggestedStartups.map(startup => (
                                    <div key={startup.name} className="p-1.5 bg-card/50 rounded text-xs border border-border">
                                        <strong>{startup.name}</strong> ({startup.industry}, {startup.stage}): {startup.summary.substring(0, 50)}...
                                        <Button variant="link" size="xs" className="p-0 h-auto ml-1 text-accent hover:text-accent/80" onClick={() => handleAnalyzeStartup(startup)}>Analyze</Button>
                                    </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                     {isAiResponding && chatMessages.length > 0 && chatMessages[chatMessages.length-1].sender === 'user' && (
                        <div className="flex items-end gap-2 max-w-[85%] mr-auto">
                            <Avatar className="h-6 w-6 text-xs bg-primary text-primary-foreground"><AvatarFallback><Bot size={14}/></AvatarFallback></Avatar>
                            <div className="p-2 rounded-lg text-sm chat-bubble chat-bubble-ai flex items-center">
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin text-muted-foreground" /> <span className="text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                     )}
                  </ScrollArea>

                  {renderSuggestionButtons()}

                  <div className="p-2 border-t border-border flex items-center gap-2">
                    <Input
                      ref={chatInputRef}
                      placeholder={isAiResponding ? "Sparky is typing..." : "Continue chat..."}
                      className="h-9 text-sm flex-1 bg-input focus-visible:ring-primary"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isAiResponding || showModeSwitchSuggestion}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim() && !isAiResponding && !showModeSwitchSuggestion) {
                          e.preventDefault();
                          handleChatPopoverSubmit();
                        }
                      }}
                    />
                    <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleChatPopoverSubmit} disabled={!chatInput.trim() || isAiResponding || showModeSwitchSuggestion}>
                        <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : toolSuggestions.length > 0 ? (
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">Tool Suggestions:</p>
                  {toolSuggestions.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 p-2 hover:bg-accent rounded-md text-sm text-popover-foreground"
                      onClick={() => { setIsChatPopoverOpen(false); setSearchQuery(''); setToolSuggestions([]); }}
                    >
                      {item.icon && <item.icon className="h-4 w-4 text-primary" />}
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : showAskSparkyButton ? (
                 <div className="p-3 text-center border-t border-border">
                   <p className="text-sm text-muted-foreground mb-2">No tools match &quot;{searchQuery}&quot;.</p>
                   <Button variant="ghost" onClick={() => initiateAiChat(searchQuery)} className="text-primary hover:bg-primary/10">
                    <MessageSquare className="mr-2 h-4 w-4"/> Ask Sparky about it?
                   </Button>
                 </div>
               ) : (
                 <div className="p-4 text-center">
                   <p className="text-sm text-muted-foreground">Type to search tools or ask Sparky anything!</p>
                 </div>
               )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && <ThemeToggle />}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-border hover:border-primary transition-colors">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.username || user.email}.png?size=40&background=FFD700&color=000000`} alt={user.username || user.email || 'User Avatar'} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{getInitials(user.username || user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-popover-foreground">{user.username || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.country} - Role: {user.primaryRole?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isFounderInvestor() && (
                  <DropdownMenuItem onSelect={() => router.push('/investor-dashboard')} className="cursor-pointer">
                     <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                     <span className="text-popover-foreground">Switch to Investor View</span>
                  </DropdownMenuItem>
                )}
                 <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/features">
                    <Info className="mr-2 h-4 w-4" />
                    <span className="text-popover-foreground">Platform Features</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/kb">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span className="text-popover-foreground">Knowledge Base</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer" disabled>
                  <Link href="#">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span className="text-popover-foreground">My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer" disabled>
                  <Link href="#">
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="text-popover-foreground">Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild className="cursor-pointer" disabled>
                  <Link href="#">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span className="text-popover-foreground">Support Center</span>
                  </Link>
                </DropdownMenuItem>
                {isMobile && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between items-center">
                      <span className="text-popover-foreground">Theme</span>
                      <ThemeToggle />
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive dark:text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

    