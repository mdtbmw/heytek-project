
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, tekkerAgreementSchema, type TekkerAgreementData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileSignature, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

export default function TekkerAgreementPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<TekkerAgreementData>({
    resolver: zodResolver(tekkerAgreementSchema),
    defaultValues: onboardingData.tekkerAgreement || {
      agreeToPlatformTerms: false,
      understandsEngagementModel: false,
      agreeToCodeOfHonor: false,
    },
  });

  useEffect(() => {
    setCurrentStep(5); // Tekker Agreement is Step 5 in their 8-step flow
  }, [setCurrentStep]);

  const onSubmit = (data: TekkerAgreementData) => {
    updateOnboardingData({ tekkerAgreement: data });
    setCurrentStep(6); // Next is Legal Base (Step 6)
    router.push('/agent-onboarding/legal');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <FileSignature className="h-8 w-8" /> Tekker Implementation Agreement
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Please review and agree to the terms for HeyTek Implementers, {onboardingData.profile?.fullName?.split(' ')[0] || 'Tekker'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="agreeToPlatformTerms"
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
                      I agree to the <Link href="/tekker-platform-terms" target="_blank" className="underline text-primary hover:text-primary/80">HeyTek Platform Terms for Tekkers</Link>.
                    </FormLabel>
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="understandsEngagementModel"
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
                      I understand the HeyTek Engagement Model, including the goal of full 'Build' implementation within approximately 3 months and the task-based payment accumulation for completed and approved work.
                    </FormLabel>
                     <FormDescription className="text-xs">Details are outlined in the Platform Terms and Tekker Payment Guidelines.</FormDescription>
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreeToCodeOfHonor"
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
                     <ShieldCheck size={16}/> I agree to uphold the <Link href="/tekker-code-of-honor" target="_blank" className="underline text-primary hover:text-primary/80">Tekker Code of Honor</Link>.
                    </FormLabel>
                    <FormDescription className="text-xs">This outlines our commitment to quality, professionalism, and collaboration.</FormDescription>
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(4); router.push('/agent-onboarding/tekker-profile');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Agree & Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
