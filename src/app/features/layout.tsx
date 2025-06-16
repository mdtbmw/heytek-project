
'use client';
import type { ReactNode } from 'react';
import { AppLogo } from '@/components/layout/AppLogo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/onboarding/ThemeToggle';
import { Home, BookOpen, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  const getUserDashboardPath = () => {
    if (!user || !user.role) return "/dashboard";
    const rolePaths: Record<string, string> = {
      founder_ceo: "/dashboard",
      tekker: "/tekker-dashboard",
      brand_consultant: "/consultant-dashboard",
      investor: "/investor-dashboard",
      other: "/dashboard",
    };
    return rolePaths[user.role] || "/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary/30 dark:selection:bg-primary/50">
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 dark:bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppLogo />
          <nav className="flex items-center space-x-2 sm:space-x-4">
             <Button variant="ghost" asChild size="sm">
                <Link href="/" className="text-muted-foreground hover:text-primary no-blue-link flex items-center gap-1">
                    <Home size={16}/> <span className="hidden sm:inline">Home</span>
                </Link>
            </Button>
             <Button variant="ghost" asChild size="sm">
                 <Link href="/kb" className="text-muted-foreground hover:text-primary no-blue-link flex items-center gap-1">
                    <BookOpen size={16}/> <span className="hidden sm:inline">Knowledge Base</span>
                 </Link>
            </Button>
            {!isLoading && isAuthenticated ? (
              <Button asChild size="sm" className="no-blue-link">
                <Link href={getUserDashboardPath()}>
                  <LayoutDashboard size={16} className="mr-1 sm:mr-2" /> Go to Dashboard
                </Link>
              </Button>
            ) : !isLoading && (
              <>
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex no-blue-link">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="no-blue-link">
                    <Link href="/agent-onboarding/welcome">Get Started</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/70">
        <div className="container mx-auto">
            <p>© {new Date().getFullYear()} HeyTek AI Startup Launcher. All rights reserved.</p>
            <div className="mt-2 space-x-4">
                <Link href="/terms" className="hover:text-primary no-blue-link">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-primary no-blue-link">Privacy Policy</Link>
                <Link href="/kb" className="hover:text-primary no-blue-link">Help & Support</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
