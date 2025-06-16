
'use client';

import { useAgentOnboarding } from '@/contexts/AgentOnboardingContext';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, User, Eye, Landmark, ShieldCheck, UserPlus, PartyPopper, Rocket, Briefcase, DollarSign, FileSignature, Users as UsersIcon, Settings, Lightbulb, ScrollText } from 'lucide-react';

interface ProgressBarProps {
  className?: string;
}

export function ProgressBar({ className }: ProgressBarProps) {
  const { onboardingData, currentStep, totalSteps } = useAgentOnboarding();
  const progressPercentage = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  const getStepDetails = () => {
    const role = onboardingData.vision?.path;
    let steps = [
      { name: "Welcome", Icon: PartyPopper },
      { name: "Your Profile", Icon: User },
      { name: "Choose Path", Icon: Eye },
    ];

    if (role === 'founder_ceo') {
      steps.push({ name: "Founder Setup", Icon: Rocket });
      steps.push({ name: "Legal Base", Icon: Landmark });
      steps.push({ name: "Account Setup", Icon: UserPlus });
      steps.push({ name: "Complete!", Icon: PartyPopper });
    } else if (role === 'tekker') {
      steps.push({ name: "Tekker Profile", Icon: Briefcase });
      steps.push({ name: "Tekker Agreement", Icon: FileSignature });
      steps.push({ name: "Legal Base", Icon: Landmark });
      steps.push({ name: "Account Setup", Icon: UserPlus });
      steps.push({ name: "Complete!", Icon: PartyPopper });
    } else if (role === 'brand_consultant') {
      steps.push({ name: "Consultant Focus", Icon: UsersIcon });
      steps.push({ name: "Consultant Agreement", Icon: FileSignature });
      steps.push({ name: "Legal Base", Icon: Landmark });
      steps.push({ name: "Account Setup", Icon: UserPlus });
      steps.push({ name: "Complete!", Icon: PartyPopper });
    } else if (role === 'investor') {
      steps.push({ name: "Investor Interests", Icon: DollarSign });
      steps.push({ name: "Investor Qualification", Icon: ShieldCheck });
      steps.push({ name: "Legal Base", Icon: Landmark });
      steps.push({ name: "Account Setup", Icon: UserPlus });
      steps.push({ name: "Complete!", Icon: PartyPopper });
    } else {
      // Default path if no role selected yet (early steps) or unexpected role
      steps.push({ name: "Role Details", Icon: Settings });
      steps.push({ name: "Agreements", Icon: ScrollText });
      steps.push({ name: "Legal Base", Icon: Landmark });
      steps.push({ name: "Account Setup", Icon: UserPlus });
      steps.push({ name: "Complete!", Icon: PartyPopper });
    }
    return steps.slice(0, totalSteps); // Ensure we don't exceed totalSteps
  };

  const stepDetails = getStepDetails();

  return (
    <div className={cn("w-full my-8 md:my-12", className)}>
      <div className="hidden sm:flex justify-between mb-3">
        {stepDetails.map((step, index) => (
          <div key={index} className={cn(
            "flex-1 text-center group transition-all duration-300",
            currentStep > index ? "text-primary font-semibold" : "text-muted-foreground"
          )}>
            <step.Icon className={cn(
              "h-7 w-7 mx-auto mb-1 transition-all duration-300",
              currentStep === index + 1 ? "text-primary scale-110 animate-pulse-once" :
              currentStep > index + 1 ? "text-primary" : "text-muted-foreground/70 group-hover:text-muted-foreground"
            )} />
            <span className={cn("text-xs", currentStep === index + 1 ? "font-bold" : "group-hover:text-foreground/90")}>{step.name}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-muted dark:bg-secondary/50 rounded-full h-2.5 relative overflow-hidden">
        <div
          className="bg-primary dark:bg-primary h-2.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
       <p className="text-center text-sm text-muted-foreground mt-3">
        Step {currentStep} of {totalSteps}: <span className="font-semibold text-primary">{stepDetails[currentStep-1]?.name || "Next Step"}</span>
      </p>
    </div>
  );
}
