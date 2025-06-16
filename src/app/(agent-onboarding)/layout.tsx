
'use client';
import type { ReactNode } from 'react';
import { AgentOnboardingProvider } from '@/contexts/AgentOnboardingContext';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { AppLogo } from '@/components/layout/AppLogo';
import { ThemeToggle } from '@/components/onboarding/ThemeToggle';

export default function AgentOnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <AgentOnboardingProvider>
      <div className="min-h-screen flex flex-col bg-background dark:bg-background text-foreground dark:text-foreground font-body selection:bg-primary/30 dark:selection:bg-primary/50">
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 dark:bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <AppLogo />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressBar />
          <div className="max-w-3xl mx-auto">
            {children}
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/70">
          © {new Date().getFullYear()} HeyTek AI Startup Launcher. All rights reserved.
        </footer>
      </div>
    </AgentOnboardingProvider>
  );
}
