
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle, Share2, Rocket, Gift } from 'lucide-react';
import Image from 'next/image';

// Simple confetti component for demo
const ConfettiPiece = ({ id, style, colorClass }: { id: number; style: React.CSSProperties; colorClass: string }) => (
  <div
    key={id}
    className={`absolute w-2 h-4 rounded-sm animate-confetti-fall ${colorClass}`}
    style={style}
  />
);

export default function CompletePage() {
  const { onboardingData, setCurrentStep, totalSteps } = useAgentOnboarding();
  const router = useRouter();

  useEffect(() => {
    setCurrentStep(totalSteps); // Set current step to the dynamic totalSteps from context
  }, [setCurrentStep, totalSteps]);

  const firstName = onboardingData.profile?.fullName?.split(' ')[0] || 'Agent';
  const rolePath = onboardingData.vision?.path;

  const getRoleSpecificDetails = () => {
    switch (rolePath) {
      case 'founder_ceo':
        return { title: 'Let\'s Build Your Empire!', buttonText: 'Go to Founder Dashboard', dashboardPath: '/dashboard' };
      case 'tekker':
        return { title: 'Get Ready to Tek!', buttonText: 'Go to Tekker Dashboard', dashboardPath: '/tekker-dashboard' };
      case 'brand_consultant':
        return { title: 'Time to Strategize!', buttonText: 'Go to Consultant Dashboard', dashboardPath: '/consultant-dashboard' };
      case 'investor':
        return { title: 'Scout Your Next Unicorn!', buttonText: 'Go to Investor Dashboard', dashboardPath: '/investor-dashboard' };
      default:
        return { title: 'Start Your Journey!', buttonText: 'Go to Dashboard', dashboardPath: '/dashboard' };
    }
  };

  const roleDetails = getRoleSpecificDetails();

  const confettiPieces = Array.from({ length: 50 }).map((_, i) => {
    const randomX = Math.random() * 100; // vw
    const randomDelay = Math.random() * 3; // seconds
    const randomDuration = 2 + Math.random() * 2; // seconds
    const colors = ['bg-primary', 'bg-secondary', 'bg-muted', 'bg-foreground'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return {
      id: i,
      style: {
        left: `${randomX}vw`,
        animationDelay: `${randomDelay}s`,
        animationDuration: `${randomDuration}s`,
        transform: `rotate(${Math.random() * 360}deg)`
      },
      colorClass: randomColor
    };
  });

  const handleAction = () => {
    router.push(roleDetails.dashboardPath);
  };

  return (
    <div className="relative overflow-hidden">
      {confettiPieces.map(p => (
         <ConfettiPiece key={p.id} id={p.id} style={p.style} colorClass={p.colorClass} />
      ))}
      <Card className="w-full shadow-xl text-center animate-slide-in bg-card dark:bg-card z-10 relative">
        <CardHeader>
           <Gift className="h-20 w-20 text-primary mx-auto mb-4 animate-pulse-once" />
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary dark:text-primary">
            Welcome to the Tekverse, {firstName}!
          </CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground dark:text-muted-foreground pt-2">
            Your onboarding is complete. {roleDetails.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="p-6 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30 dark:border-primary/50">
            <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2 text-primary dark:text-primary">
              <CheckCircle className="h-6 w-6" /> Certified Agent Onboarding Complete
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground">
              You now have access to all the tools and resources to help brands and founders succeed.
            </p>
            <div className="mt-4">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/10">
                <Share2 className="mr-2 h-4 w-4" /> Share Your Badge (Mock)
              </Button>
            </div>
          </div>

          <div className="relative w-48 h-48 mx-auto my-4">
             <Image
                src="https://placehold.co/300x300/FFD700/0A192F.png?text=🎉"
                alt="Welcome illustration"
                layout="fill"
                objectFit="contain"
                data-ai-hint="celebration success yellow darkblue"
                className="rounded-full"
              />
          </div>

          <Button
            onClick={handleAction}
            className="w-full md:w-auto bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg px-8 py-6"
          >
            {roleDetails.buttonText} <Rocket className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
