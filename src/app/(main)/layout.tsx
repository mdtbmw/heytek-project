
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AppLogo } from '@/components/layout/AppLogo';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, PanelLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomCursor from '@/components/ui/CustomCursor'; // Import the custom cursor

function CollapsedSidebarHeaderTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="h-6 w-6" />
    </Button>
  );
}


export default function MainLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Add custom-cursor class to body when this layout is active
    if (!isMobile) { // Optionally disable custom cursor on mobile
      document.body.classList.add('custom-cursor-active');
    }
    return () => {
      // Clean up class when layout unmounts
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <AppLogo />
          <Skeleton className="h-8 w-48" />
          <p className="text-muted-foreground">Loading your awesome startup tools...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {!isMobile && <CustomCursor />} {/* Render custom cursor for non-mobile */}
      <Sidebar variant="sidebar" collapsible="icon" side="left" className="border-r border-sidebar-border hidden md:flex">
        <SidebarHeader className="p-2 border-b border-sidebar-border h-16 flex items-center justify-center group-data-[state=expanded]:justify-start group-data-[state=expanded]:p-4">
          <div className="group-data-[state=collapsed]:hidden">
             <AppLogo className="logo-in-dark-sidebar" />
          </div>
          <div className="group-data-[state=expanded]:hidden flex items-center justify-center w-full h-full">
             <CollapsedSidebarHeaderTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border space-y-2 group-data-[state=expanded]:p-4">
           <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:w-10"
           >
            <LogOut className="h-5 w-5" />
            <span className="group-data-[state=collapsed]:hidden">Log out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className={isMobile ? 'pb-20' : ''}>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-muted/30 dark:bg-background">
          {children}
        </main>
      </SidebarInset>
      {isMobile && <MobileBottomNav />}
    </SidebarProvider>
  );
}
