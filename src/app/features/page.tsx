
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Lightbulb,
  Sparkles,
  Palette,
  Gavel,
  LayoutTemplate,
  Users,
  Rocket,
  ListChecks,
  Mic,
  HelpCircle,
  ShieldCheck,
  Network,
  ArrowRight,
  Building,
  FileText,
  FolderKanban, // Added FolderKanban
  MonitorPlay, // Added MonitorPlay
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const featureCategories = [
  {
    categoryTitle: "AI-Powered Company Ideation & Foundation",
    icon: Brain,
    features: [
      {
        icon: Lightbulb,
        title: 'AI Idea Igniter (Sparky)',
        description: 'Brainstorm, refine, and clarify your business concepts with an interactive AI. Sparky helps you define your core idea, problem, solution, and target audience, even if you start with a blank slate.',
        link: '/idea-extractor',
        linkText: 'Ignite Your Idea',
        dataAiHint: 'brainstorm lightbulb idea',
      },
      {
        icon: Sparkles,
        title: 'AI Business Name Generator',
        description: 'Discover creative and available business names. AI suggestions include mock domain and social media checks to find the perfect fit.',
        link: '/name-generator',
        linkText: 'Find Your Company Name',
        dataAiHint: 'magic stars name',
      },
      {
        icon: Palette,
        title: 'AI Brand Identity Suite',
        description: 'Generate unique taglines, vision & mission statements, brand descriptions, product profiles, and even ASCII logos. AI crafts a brand that reflects your unique venture.',
        link: '/brand-generator',
        linkText: 'Craft Your Brand Identity',
        dataAiHint: 'palette colors branding',
      },
       {
        icon: FileText, // Added for Product Profile
        title: 'AI Product/Service Profile Generator',
        description: 'Craft concise, impactful profiles for your product or service, perfect for pitch decks and one-pagers. AI helps articulate your value proposition clearly.',
        link: '/product-profile-generator',
        linkText: 'Define Your Product',
        dataAiHint: 'document profile product',
      },
    ],
  },
  {
    categoryTitle: "AI-Driven Company Structuring & Operations",
    icon: Building,
    features: [
       {
        icon: Gavel,
        title: 'AI Legal Setup Guidance',
        description: 'Receive AI-driven suggestions for legal structures, compliance checklists, and documentation templates based on your country and business type.',
        link: '/legal-setup',
        linkText: 'Navigate Legal Setup',
        dataAiHint: 'law gavel documents company',
      },
      {
        icon: LayoutTemplate,
        title: 'AI Operational Structure Blueprint',
        description: 'Outline departments, roles, and SOPs. HeyTek AI helps generate foundational operational structures tailored to your company\'s industry and scale. (View progress on Dashboard)',
        link: '/dashboard', // Link to dashboard where this will be housed
        linkText: 'Structure Your Operations',
        dataAiHint: 'blueprint organization chart',
      },
      {
        icon: FolderKanban, // New Icon for Folder System
        title: 'AI-Powered Organizational Folder System (Conceptual)',
        description: 'HeyTek aims to automatically create and manage a tailored folder structure for all your company assets, ensuring everything is organized and accessible. (View concept on Dashboard)',
        link: '/dashboard', // Links to dashboard where the asset tab is
        linkText: 'Organize Your Assets',
        dataAiHint: 'folder organization files',
      },
       {
        icon: ShieldCheck,
        title: 'Comprehensive Onboarding for All Roles',
        description: 'Tailored step-by-step guidance for Founders, Tekkers, Consultants, and Investors to seamlessly integrate into the HeyTek ecosystem.',
        link: '/agent-onboarding/welcome',
        linkText: 'Join the HeyTek Ecosystem',
        dataAiHint: 'shield check user group',
      },
    ],
  },
   {
    categoryTitle: "AI-Powered Branding & Digital Presence",
    icon: Palette,
    features: [
      {
        icon: MonitorPlay, // New Icon for Website Generation
        title: 'AI-Generated Brand Website (Conceptual)',
        description: 'Transform your brand identity into a foundational web presence. HeyTek AI will aim to generate a basic, branded website including key pages. (View concept on Branding Kit page)',
        link: '/branding-package', // Links to branding package page
        linkText: 'Visualize Your Website',
        dataAiHint: 'website monitor screen',
      },
      {
        icon: Package,
        title: 'Branding Kit & Assets',
        description: 'Access and manage your AI-generated or uploaded logos, color palettes, mood boards, and typography guidelines in one place.',
        link: '/branding-package',
        linkText: 'Access Your Branding Kit',
        dataAiHint: 'package box brand',
      },
    ],
  },
  {
    categoryTitle: "Role-Specific AI Power Tools",
    icon: Users,
    features: [
      {
        icon: ListChecks,
        title: 'AI Implementation Planner (Tekkers)',
        description: 'Tekkers can generate high-level technical plans for HeyTek "Builds," detailing phases, tasks, and potential challenges for efficient execution.',
        link: '/implementation-planner',
        linkText: 'Plan a Build',
        dataAiHint: 'checklist planning tasks',
      },
      {
        icon: Mic,
        title: 'AI Brand Voice Generator (Consultants)',
        description: 'Brand Consultants can create distinct brand voice archetypes for their clients, complete with examples and rationale, enhancing strategic advising.',
        link: '/brand-voice-tool',
        linkText: 'Develop Client Brand Voice',
        dataAiHint: 'microphone sound branding',
      },
      {
        icon: HelpCircle,
        title: 'AI Due Diligence Questions (Investors)',
        description: 'Investors receive AI-generated, tailored lists of due diligence questions based on startup industry and investment stage for thorough evaluations.',
        link: '/due-diligence-questions',
        linkText: 'Sharpen Due Diligence',
        dataAiHint: 'magnifying glass questions investment',
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="space-y-12 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="text-center py-12 md:py-20 bg-gradient-to-b from-background to-secondary/30 dark:to-secondary/40 rounded-lg shadow-inner border border-border">
        <div className="relative w-24 h-24 mx-auto mb-6">
            <Image
                src="http://mdtbmw.heytek.ng/wp-content/uploads/2025/06/heylogo.svg"
                alt="HeyTek Features"
                fill
                className="object-contain animate-pulse-once"
            />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-foreground dark:text-primary">
          HeyTek: AI-Powered Company Creation & Growth Engine
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground dark:text-foreground/80 max-w-3xl mx-auto">
          From a spark of an idea to a fully structured, operational company – HeyTek leverages AI to guide you through ideation, branding, legal setup, operational design, and growth strategies. Build your entire venture, uniquely tailored and intelligently assisted.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground px-8 py-3 text-lg group">
            <Link href="/agent-onboarding/welcome">
              Build Your Company with AI <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {featureCategories.map((category, catIndex) => (
        <section key={catIndex} className="py-8">
          <div className="text-center mb-10">
            <category.icon className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="text-3xl font-bold font-headline text-foreground">{category.categoryTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {category.features.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col bg-card dark:bg-card/90 hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/70 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <CardHeader className="pb-4">
                  <div className="mb-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-full w-fit group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary group-hover:animate-pulse-once" />
                  </div>
                  <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-muted-foreground dark:text-foreground/75 min-h-[60px]">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:bg-primary dark:group-hover:text-primary-foreground transition-colors">
                    <Link href={feature.link || '#'}>
                      {feature.linkText || 'Learn More'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ))}

       <section className="py-12 text-center">
        <Card className="bg-gradient-to-r from-primary/80 via-primary to-accent/80 dark:from-primary/70 dark:via-primary/90 dark:to-accent/70 p-8 md:p-12 rounded-xl shadow-2xl">
          <CardContent className="text-primary-foreground dark:text-primary-foreground">
            <Network className="h-12 w-12 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Build Your Company?</h2>
            <p className="text-lg mb-6 max-w-xl mx-auto opacity-90">
              Join HeyTek and transform your entrepreneurial vision into a structured, operational reality.
              Our AI-powered platform is designed to support you every step of the way.
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 text-md px-10 py-3 group">
              <Link href="/agent-onboarding/welcome">
                Start Your Company <Rocket className="ml-2 h-5 w-5 group-hover:animate-pulse-once" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
