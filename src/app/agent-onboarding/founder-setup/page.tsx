
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, founderSetupSchema, type FounderSetupData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Rocket, TrendingUp, Lightbulb, DollarSign, Building } from 'lucide-react';
import { useEffect } from 'react';

const projectStages = [
  { id: 'idea', label: 'Idea Stage', icon: Lightbulb, color: "text-primary" },
  { id: 'prototype', label: 'Prototype/MVP', icon: TrendingUp, color: "text-primary" },
  { id: 'early_traction', label: 'Early Traction', icon: Rocket, color: "text-primary" },
  { id: 'scaling', label: 'Scaling', icon: Building, color: "text-primary" },
];

export default function FounderSetupPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<FounderSetupData>({
    resolver: zodResolver(founderSetupSchema),
    defaultValues: onboardingData.founderSetup || {
      companyName: '',
      projectStage: undefined,
      fundingGoal: '',
    },
  });

  useEffect(() => {
    setCurrentStep(4); // This is step 4 for Founders
  }, [setCurrentStep]);

  const onSubmit = (data: FounderSetupData) => {
    updateOnboardingData({ founderSetup: data });
    setCurrentStep(5); // Next is Legal for Founders
    router.push('/agent-onboarding/legal');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <Rocket className="h-8 w-8" /> Founder & CEO Setup
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Tell us about your venture, {onboardingData.profile?.fullName?.split(' ')[0] || 'Founder'}! This helps us tailor resources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Company/Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Innovate AI, The Next Big Thing" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectStage"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground"/> Current Project Stage
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {projectStages.map((stage) => (
                        <FormItem
                          key={stage.id}
                          className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 has-[:checked]:bg-primary/10 dark:has-[:checked]:bg-primary/20 has-[:checked]:border-primary dark:has-[:checked]:border-primary cursor-pointer transition-all duration-200 group"
                        >
                          <FormControl>
                            <RadioGroupItem value={stage.id} id={`stage-${stage.id}`} />
                          </FormControl>
                          <FormLabel htmlFor={`stage-${stage.id}`} className="font-normal text-sm cursor-pointer flex-1 flex items-center gap-2">
                            <stage.icon className={`h-5 w-5 ${stage.color || 'text-muted-foreground'} group-data-[state=checked]:text-primary`} />
                            {stage.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundingGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground"/>Funding Goal (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $50,000 - $100,000, or 'Bootstrapping'" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormDescription className="text-xs">What are your initial funding aspirations or status?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(3); router.push('/agent-onboarding/vision');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Next: Legal Setup <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
