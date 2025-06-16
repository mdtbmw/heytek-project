
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding } from '@/contexts/AgentOnboardingContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle, Zap, LogIn } from 'lucide-react'; 
import { useEffect, useState } from 'react';
import Link from 'next/link';

const animatedWalkthroughItems = [
  "We help brands build structure.",
  "We make founders sleep easy.",
  "We Tek the burden off their shoulders.",
  "Your AI Co-Pilot for Startup Success!"
];

export default function WelcomePage() {
  const { setCurrentStep, updateOnboardingData, onboardingData, resetOnboardingData } = useAgentOnboarding();
  const router = useRouter();
  const [visibleItemIndex, setVisibleItemIndex] = useState(-1);
  const searchParams = useSearchParams(); 

  useEffect(() => {
    resetOnboardingData(); 
    setCurrentStep(1);
    
    const pathFromQuery = searchParams?.get('initialPath');
    if (pathFromQuery) { 
      updateOnboardingData({ initialPath: pathFromQuery });
    }

    const timers = animatedWalkthroughItems.map((_, index) => 
      setTimeout(() => {
        setVisibleItemIndex(index);
      }, (index + 1) * 600) 
    );
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOnboardingData, setCurrentStep, searchParams, updateOnboardingData]); 

  const handleNext = () => {
    setCurrentStep(2);
    router.push('/agent-onboarding/profile');
  };

  return (
    <Card className="w-full shadow-xl bg-card dark:bg-card border-primary/30 dark:border-primary/50 animate-slide-in">
      <CardHeader className="text-center pt-8">
        <Zap className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse-once" />
        <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary dark:text-primary">
          Welcome to Your HeyTek Journey!
        </CardTitle>
        <CardDescription className="text-md md:text-lg text-muted-foreground dark:text-muted-foreground pt-2 max-w-xl mx-auto">
          You&apos;re about to embark on an exciting adventure to launch or support groundbreaking ventures. Let&apos;s get started!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10 text-center pb-8">
        <div className="mt-6 space-y-4">
          {animatedWalkthroughItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-center gap-3 text-lg md:text-xl text-foreground dark:text-foreground transition-all duration-500 ease-out ${
                visibleItemIndex >= index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <CheckCircle className="h-7 w-7 text-primary dark:text-primary flex-shrink-0" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
        
        <div className="py-4 px-6 bg-secondary/50 dark:bg-secondary/30 rounded-lg border border-border">
          <p className="text-lg italic text-muted-foreground dark:text-muted-foreground/90">
            &quot;Welcome to HeyTek – where <span className="text-primary">creativity</span> meets <span className="text-primary">clarity</span>, and structure becomes your superpower.
            You’re not just signing up. You’re becoming the future of brands across the world.&quot;
          </p>
        </div>

        <Button 
          onClick={handleNext} 
          className="w-full md:w-auto bg-primary hover:bg-primary/80 text-primary-foreground text-xl px-10 py-7 animate-pulse-once rounded-lg shadow-lg"
          disabled={visibleItemIndex < animatedWalkthroughItems.length -1}
        >
          Begin Your Journey <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
         <div className="text-center text-sm pt-2">
            <Link href="/login" className="text-muted-foreground hover:text-primary no-blue-link flex items-center justify-center gap-1">
                <LogIn size={14}/> Already have an account? Log In
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
