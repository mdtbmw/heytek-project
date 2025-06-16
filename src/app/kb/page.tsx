
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Rocket, Code, DollarSign, Users as UsersIcon, Lightbulb, Search, Send, Bot, BookOpen, LifeBuoy, ExternalLink, MessageCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { askSparkyKB } from '@/ai/flows/kb-chat-flow';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface KBSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  signupPath?: string; 
  loggedInContent?: React.ReactNode;
  loggedOutContent?: React.ReactNode;
  faqs?: { question: string; answer: string }[];
}

const knowledgeBaseSections: KBSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with HeyTek',
    icon: Rocket,
    description: 'New to HeyTek? Learn the basics, understand our mission, and how we can help you succeed.',
    faqs: [
      { question: 'What is HeyTek?', answer: 'HeyTek is an AI-powered platform designed to help entrepreneurs and businesses ideate, build, operate, and grow their ventures with structured guidance and intelligent tools.' },
      { question: 'How does the AI help?', answer: 'Our AI, Sparky, assists with idea generation, business naming, brand creation, legal guidance, and more, providing personalized support throughout your journey.' },
      { question: 'Is HeyTek free to use?', answer: 'HeyTek offers various plans, including a free tier to get started. Specific tools and features may be part_of premium subscriptions.' },
    ],
  },
  {
    id: 'founders',
    title: 'For Founders & CEOs',
    icon: Rocket,
    description: 'Turn your vision into reality. Tools and guides for startup founders.',
    signupPath: 'founder_ceo',
    loggedInContent: (
      <>
        <p className="mb-2">Access your Founder Dashboard for AI tools like Idea Extraction, Name Generation, Brand Elements, Pitch Deck Outlines, and Legal Setup guidance.</p>
        <Button asChild variant="link" className="p-0 h-auto text-primary"><Link href="/dashboard">Go to My Founder Dashboard <ExternalLink className="ml-1 h-4 w-4" /></Link></Button>
      </>
    ),
    loggedOutContent: (
      <>
        <p className="mb-2">Learn how HeyTek helps you conceptualize, name, brand, and structure your startup with AI assistance.</p>
      </>
    ),
    faqs: [
      { question: 'How do I use the Idea Extractor?', answer: 'Navigate to the Idea Extractor from your dashboard. Sparky will guide you through a conversation to refine your startup idea.' },
      { question: 'Can HeyTek help me with my pitch deck?', answer: 'Yes! The Pitch Deck Outline generator provides a structured template based on your startup details to help you create a compelling pitch.' },
    ],
  },
  {
    id: 'tekkers',
    title: 'For Tekkers (Implementers)',
    icon: Code,
    description: 'Implement "Builds" for founders and get paid for your technical expertise.',
    signupPath: 'tekker',
    loggedInContent: (
      <>
        <p className="mb-2">Manage your active implementations, browse the Build Marketplace, track your payouts, and use the AI Implementation Planner from your Tekker Dashboard.</p>
        <Button asChild variant="link" className="p-0 h-auto text-primary"><Link href="/tekker-dashboard">Go to My Tekker Dashboard <ExternalLink className="ml-1 h-4 w-4" /></Link></Button>
      </>
    ),
    loggedOutContent: (
      <>
        <p className="mb-2">Discover how to apply for "Builds", manage implementation projects, and leverage AI tools to plan your work.</p>
      </>
    ),
     faqs: [
      { question: 'What is a "Build"?', answer: 'A "Build" is a project posted by a founder that requires technical implementation. Tekkers apply to implement these Builds.' },
      { question: 'How does the AI Implementation Planner work?', answer: 'Provide details about a Build, and the AI will generate a high-level technical plan including phases and key tasks.' },
    ],
  },
  {
    id: 'consultants',
    title: 'For Brand Consultants',
    icon: UsersIcon,
    description: 'Advise clients on brand strategy using HeyTek\'s AI-powered tools.',
    signupPath: 'brand_consultant',
     loggedInContent: (
      <>
        <p className="mb-2">Utilize the AI Brand Voice Generator and other strategic tools to assist your clients. Manage your client engagements from the Consultant Dashboard.</p>
        <Button asChild variant="link" className="p-0 h-auto text-primary"><Link href="/consultant-dashboard">Go to My Consultant Dashboard <ExternalLink className="ml-1 h-4 w-4" /></Link></Button>
      </>
    ),
    loggedOutContent: (
      <>
        <p className="mb-2">Explore tools like the AI Brand Voice Generator to help your clients define their unique market positioning and communication style.</p>
      </>
    ),
    faqs: [
      { question: 'How can the AI Brand Voice tool help my clients?', answer: 'It generates 2-3 distinct brand voice archetypes with descriptions and examples, providing a great starting point for brand strategy discussions.' },
    ],
  },
  {
    id: 'investors',
    title: 'For Investors',
    icon: DollarSign,
    description: 'Discover and evaluate investment opportunities on the HeyTek platform.',
    signupPath: 'investor',
    loggedInContent: (
      <>
        <p className="mb-2">Browse vetted startup opportunities, manage your portfolio, and use the AI Due Diligence Question Generator from your Investor Dashboard.</p>
        <Button asChild variant="link" className="p-0 h-auto text-primary"><Link href="/investor-dashboard">Go to My Investor Dashboard <ExternalLink className="ml-1 h-4 w-4" /></Link></Button>
      </>
    ),
    loggedOutContent: (
      <>
        <p className="mb-2">Learn how HeyTek curates investment opportunities and provides AI tools to assist with your due diligence process.</p>
      </>
    ),
    faqs: [
      { question: 'How does the AI Due Diligence tool work?', answer: 'Input the startup\'s industry and stage, and the AI will generate a list of relevant due diligence questions to guide your evaluation.' },
    ],
  },
];

// Function to summarize KB for AI context
function summarizeKBForAI(sections: KBSection[]): string {
  return sections.map(section => {
    let content = `Section: ${section.title}\nDescription: ${section.description}\n`;
    if (section.faqs && section.faqs.length > 0) {
      content += "Relevant FAQs:\n";
      section.faqs.forEach(faq => {
        content += `- Q: ${faq.question}\n  A: ${faq.answer}\n`;
      });
    }
    return content;
  }).join("\n\n---\n\n");
}

const knowledgeBaseSummaryForAI = summarizeKBForAI(knowledgeBaseSections);

export default function KnowledgeBasePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAIChatLoading, setIsAIChatLoading] = useState(false);
  const [aiChatError, setAIChatError] = useState<string | null>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const initializeChat = useCallback(() => {
    setChatMessages([{ id: 'ai-intro', text: "Hi! I'm Sparky, your HeyTek knowledge assistant. How can I help you find information about our platform or features today?", sender: 'ai' }]);
  }, []);

  useEffect(() => {
    if (chatMessages.length === 0) {
      initializeChat();
    }
  }, [chatMessages.length, initializeChat]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTo({ top: chatScrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const currentUserInput = chatInput;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), text: currentUserInput, sender: 'user' };
    
    const currentChatHistory = chatMessages
      .slice(-5) // Take last 5 messages for history context
      .map(msg => `${msg.sender === 'ai' ? 'AI' : 'User'}: ${msg.text}`)
      .join('\n');

    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsAIChatLoading(true);
    setAIChatError(null);

    try {
      const result = await askSparkyKB({
        userInput: currentUserInput,
        chatHistory: currentChatHistory,
        knowledgeBaseSummary: knowledgeBaseSummaryForAI,
      });
      const aiResponse: ChatMessage = { id: (Date.now() + 1).toString(), text: result.aiResponse, sender: 'ai' };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Error calling KB chat flow:', err);
      const errorMsg = "Sparky's having a bit of a moment and couldn't process that. Please try rephrasing or check back in a bit!";
      setChatMessages(prev => [...prev, { id: 'err-' + Date.now(), text: errorMsg, sender: 'ai'}]);
      setAIChatError(errorMsg);
      toast({ title: "AI Chat Error", description: "Could not get a response from Sparky.", variant: "destructive"});
    } finally {
      setIsAIChatLoading(false);
    }
  };

  const filteredSections = knowledgeBaseSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (section.faqs && section.faqs.some(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );
  
  if (authLoading) {
      return <div className="container mx-auto px-4 py-8 text-center">Loading Knowledge Base...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary dark:text-primary">
          HeyTek Knowledge Base & Help Center
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers, learn how to use HeyTek effectively, and get support for your startup journey.
        </p>
      </header>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Knowledge Base (e.g., 'how to name my startup', 'tekker payments')"
            className="pl-10 py-3 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {filteredSections.map((section) => (
            <Card key={section.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <section.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-headline">{section.title}</CardTitle>
                </div>
                <CardDescription className="text-md">{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isAuthenticated && user?.role === section.signupPath ? (
                    section.loggedInContent
                ) : (
                    section.loggedOutContent
                )}

                {!isAuthenticated && section.signupPath && (
                   <div className="mt-3 pt-3 border-t border-border/50">
                     <h4 className="font-semibold text-sm mb-2 text-primary">New to HeyTek as a {section.title.replace('For ', '')}?</h4>
                     <p className="text-xs text-muted-foreground mb-2">Learn how to get started on your journey.</p>
                     <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                       <Link href={`/agent-onboarding/welcome?initialPath=${section.signupPath}`}>
                         Sign Up as a {section.title.replace('For ', '')}
                       </Link>
                     </Button>
                   </div>
                )}
                
                {section.faqs && section.faqs.length > 0 && (
                  <Accordion type="single" collapsible className="w-full mt-4">
                    {section.faqs.map((faq, index) => (
                      <AccordionItem value={`faq-${section.id}-${index}`} key={index}>
                        <AccordionTrigger className="text-md text-left hover:text-primary">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredSections.length === 0 && searchTerm && (
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 text-primary opacity-50"/>
                <p className="text-lg">No results found for &quot;{searchTerm}&quot;.</p>
                <p className="text-sm">Try a different search term or browse the sections below.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6 sticky top-24 self-start">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Bot className="mr-2 h-6 w-6 text-primary" />
                Ask Sparky
              </CardTitle>
              <CardDescription>Your AI assistant for HeyTek info.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col">
              <ScrollArea className="flex-1 mb-4 p-2 pr-1 border rounded-md bg-muted/20" ref={chatScrollAreaRef}>
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 text-sm max-w-[90%]",
                        msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                      )}
                    >
                      <Avatar className={cn("h-7 w-7 text-xs", msg.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background')}>
                        <AvatarFallback>{msg.sender === 'ai' ? 'AI' : user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 shadow-sm",
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-card text-card-foreground border rounded-tl-none'
                        )}
                      >
                        {msg.text.split('\n').map((line, i) => <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/(\n)/g, '<br/>') }}></p>)}
                      </div>
                    </div>
                  ))}
                   {isAIChatLoading && (
                    <div className="flex items-start gap-2 justify-start">
                        <Avatar className="h-7 w-7 text-xs bg-primary text-primary-foreground"><AvatarFallback>AI</AvatarFallback></Avatar>
                        <div className="rounded-lg px-3 py-2 shadow-sm bg-card text-card-foreground border flex items-center space-x-1">
                            <span className="text-muted-foreground text-xs italic">Sparky is thinking</span>
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        </div>
                    </div>
                  )}
                  {aiChatError && (
                     <div className="flex items-start gap-2 justify-start">
                         <Avatar className="h-7 w-7 text-xs bg-destructive text-destructive-foreground"><AvatarFallback>AI</AvatarFallback></Avatar>
                         <div className="rounded-lg px-3 py-2 shadow-sm bg-destructive/10 text-destructive border border-destructive/30 flex items-center gap-1">
                            <AlertTriangle size={14}/> <span className="text-xs">{aiChatError}</span>
                         </div>
                     </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about HeyTek..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isAIChatLoading && handleChatSubmit()}
                  className="flex-1"
                  disabled={isAIChatLoading}
                />
                <Button onClick={handleChatSubmit} size="icon" disabled={!chatInput.trim() || isAIChatLoading}>
                  {isAIChatLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center"><LifeBuoy className="mr-2 h-5 w-5 text-primary"/>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">If you can&apos;t find what you&apos;re looking for, our support team is ready to assist.</p>
                <Button className="w-full" variant="outline" onClick={() => alert('Contact support form/modal would appear here. (Mock)')}>Contact Support (Mock)</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
