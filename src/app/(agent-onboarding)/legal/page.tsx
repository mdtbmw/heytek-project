
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAgentOnboarding } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Gavel, Loader2, ShieldCheck } from 'lucide-react';
import { countries } from '@/lib/countries';

export default function LegalPage() {
  const { onboardingData, setCurrentStep, currentStep } = useAgentOnboarding();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [suggestedStructure, setSuggestedStructure] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState<string[]>([]);

  const countryName = countries.find(c => c.code === onboardingData.profile?.country)?.name || onboardingData.profile?.country;
  const role = onboardingData.vision?.path; // Removed customRole fallback as 'other' is removed

  useEffect(() => {
    const founderPath = onboardingData.vision?.path === 'founder_ceo';
    setCurrentStep(founderPath ? 5 : 6); // Step 5 for founder, 6 for others with 2 role steps

    const timer = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsLoading(false);
          if (onboardingData.profile?.country === 'US') {
            setSuggestedStructure('Limited Liability Company (LLC) or Independent Contractor (1099)');
          } else if (onboardingData.profile?.country === 'NG') {
            setSuggestedStructure('Sole Proprietorship or Business Name Registration');
          } else {
            setSuggestedStructure('General Partnership or Local Equivalent');
          }
          setGeneratedDocs([
            `Sample Agreement (for ${countryName} & ${role})`,
            `Standard Non-Disclosure Agreement (NDA)`,
            `Compliance Checklist for ${role}s in ${countryName}`,
          ]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [setCurrentStep, onboardingData.profile?.country, onboardingData.vision?.path, countryName, role]);

  const handleNext = () => {
    const founderPath = onboardingData.vision?.path === 'founder_ceo';
    setCurrentStep(founderPath ? 6 : 7); // Step 6 for founder, 7 for others
    router.push('/agent-onboarding/account');
  };
  
  const handleBack = () => {
    const path = onboardingData.vision?.path;
    switch (path) {
      case 'founder_ceo':
        setCurrentStep(4);
        router.push('/agent-onboarding/founder-setup');
        break;
      case 'tekker':
        setCurrentStep(5);
        router.push('/agent-onboarding/tekker-agreement');
        break;
      case 'brand_consultant':
        setCurrentStep(5);
        router.push('/agent-onboarding/consultant-agreement');
        break;
      case 'investor':
        setCurrentStep(5);
        router.push('/agent-onboarding/investor-qualification');
        break;
      default: // Should not be reached if vision.path is always set
        setCurrentStep(3); 
        router.push('/agent-onboarding/vision');
        break;
    }
  };


  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <Gavel className="h-8 w-8" /> Let&apos;s Set Your Legal Base
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          We use AI to suggest a legal presence for you based on your country and role. This is a simulation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 text-primary dark:text-primary animate-spin mx-auto" />
            <p className="text-lg text-muted-foreground dark:text-muted-foreground">Generating legal documents and suggestions...</p>
            <Progress value={progressValue} className="w-full [&>div]:bg-primary dark:[&>div]:bg-primary" />
             <p className="text-sm text-muted-foreground dark:text-muted-foreground">{progressValue}% Complete</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1 flex items-center gap-2 text-foreground dark:text-foreground">
                <ShieldCheck className="h-6 w-6 text-primary" />
                AI Legal Suggestion
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Based on your country (<strong>{countryName}</strong>) and chosen path (<strong>{role}</strong>), we suggest considering:
              </p>
              <p className="mt-1 text-lg font-medium text-primary dark:text-primary">{suggestedStructure}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-foreground dark:text-foreground">
                <FileText className="h-6 w-6 text-muted-foreground dark:text-muted-foreground" />
                Generated Sample Documents
              </h3>
              <ul className="list-disc list-inside space-y-2 pl-2">
                {generatedDocs.map((doc, index) => (
                  <li key={index} className="text-muted-foreground dark:text-muted-foreground">
                    {doc} - <Button variant="link" size="sm" className="p-0 h-auto text-primary dark:text-primary hover:underline">Download (Mock)</Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-6">
        <Button type="button" variant="outline" onClick={handleBack} className="border-muted-foreground text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20">
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground"
        >
          Next Step <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

    