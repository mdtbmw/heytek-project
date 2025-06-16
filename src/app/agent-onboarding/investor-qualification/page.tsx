
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, investorQualificationSchema, type InvestorQualificationData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

export default function InvestorQualificationPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<InvestorQualificationData>({
    resolver: zodResolver(investorQualificationSchema),
    defaultValues: onboardingData.investorQualification || {
      isAccreditedInvestor: false,
      understandInvestmentRisks: false,
    },
  });

  useEffect(() => {
    setCurrentStep(5); // Investor Qualification is Step 5 in their 8-step flow
  }, [setCurrentStep]);

  const onSubmit = (data: InvestorQualificationData) => {
    updateOnboardingData({ investorQualification: data });
    setCurrentStep(6); // Next is Legal Base (Step 6)
    router.push('/agent-onboarding/legal');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <ShieldCheck className="h-8 w-8" /> Investor Qualification
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Please acknowledge the following to continue, {onboardingData.profile?.fullName?.split(' ')[0] || 'Investor'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="isAccreditedInvestor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      I confirm that I meet the criteria for an <Link href="/accredited-investor-info" target="_blank" className="underline text-primary hover:text-primary/80">accredited investor</Link> in my jurisdiction (Mock Confirmation).
                    </FormLabel>
                    <FormDescription className="text-xs">This is a mock confirmation for platform demonstration purposes.</FormDescription>
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="understandInvestmentRisks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer flex items-center gap-1">
                     <AlertTriangle size={16} className="text-destructive"/> I understand that investing in startups is inherently risky and can result in the loss of my entire investment.
                    </FormLabel>
                     <FormDescription className="text-xs">Please review our <Link href="/risk-disclosure" target="_blank" className="underline text-primary hover:text-primary/80">Risk Disclosure Statement</Link>.</FormDescription>
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(4); router.push('/agent-onboarding/investor-preferences');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Acknowledge & Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
