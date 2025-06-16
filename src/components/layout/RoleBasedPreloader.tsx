
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { preloaderContent } from '@/lib/preloaderContent';
import type { LucideIcon } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { cn } from '@/lib/utils';

interface DisplayMessage {
  text: string;
  icon: LucideIcon;
}

export default function RoleBasedPreloader() {
  const { user, isLoading: authLoading } = useAuth();
  const [displayMessage, setDisplayMessage] = useState<DisplayMessage | null>(null);

  useEffect(() => {
    if (authLoading) return; // Don't pick a message until auth state is resolved

    const role = user?.primaryRole || 'default';
    const messagesForRole = preloaderContent[role] || preloaderContent.default;
    const randomIndex = Math.floor(Math.random() * messagesForRole.length);
    setDisplayMessage(messagesForRole[randomIndex]);
  }, [user, authLoading]);

  if (!displayMessage) {
    // Fallback or minimal loader if message isn't ready yet (e.g. during initial auth check)
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-preloader-fade-in">
        <AppLogo className="w-32 h-auto mb-8 opacity-80 animate-preloader-icon-pulse logo-in-dark-sidebar" />
        <div className="h-2 w-24 bg-primary rounded-full animate-pulse"></div>
      </div>
    );
  }

  const IconComponent = displayMessage.icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm text-foreground animate-preloader-fade-in p-6">
      <AppLogo className="w-32 h-auto mb-10 opacity-90 animate-preloader-icon-pulse logo-in-dark-sidebar" />
      
      <div className="text-center space-y-5">
        <IconComponent className="mx-auto h-12 w-12 text-primary animate-preloader-icon-pulse" style={{ animationDelay: '0.1s' }} />
        <p 
          className="text-xl md:text-2xl font-semibold animate-preloader-text-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          {displayMessage.text}
        </p>
      </div>

      <div className="absolute bottom-10 w-full px-6">
        <div className="h-1.5 w-full max-w-xs mx-auto bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-preloader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
