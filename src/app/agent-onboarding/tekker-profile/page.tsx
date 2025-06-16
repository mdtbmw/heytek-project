
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, tekkerProfileSchema, type TekkerProfileData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Briefcase, Link as LinkIcon, DollarSign, Wrench, Layers } from 'lucide-react';
import { useEffect } from 'react';

const implementationSpecializations = [
  { id: 'heytek_platform_config', label: 'HeyTek Platform Configuration' },
  { id: 'genkit_flow_deployment', label: 'Genkit Flow Deployment & Integration' },
  { id: 'nextjs_shadcn_impl', label: 'Next.js & ShadCN Implementation' },
  { id: 'firebase_integration', label: 'Firebase Backend/DB Integration' },
  { id: 'third_party_api_impl', label: 'Third-party API Integration' },
  { id: 'content_data_migration', label: 'Content & Data Migration/Setup' },
  { id: 'qa_testing_launch_prep', label: 'QA, Testing & Launch Preparation' },
  { id: 'technical_documentation', label: 'Technical Documentation & Handover' },
];

const experienceLevels = ["0-1 Years", "1-3 Years", "3-5 Years", "5-7 Years", "7+ Years"];
const paymentPreferences = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
];

export default function TekkerProfilePage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<TekkerProfileData>({
    resolver: zodResolver(tekkerProfileSchema),
    defaultValues: onboardingData.tekkerProfile || {
      primarySpecializations: [],
      yearsOfExperience: '',
      portfolioUrl: '',
      typicalBuildFee: '',
      paymentPreference: 'weekly', // Default value
    },
  });

  useEffect(() => {
    setCurrentStep(4); // This is Step 4 in Tekker's 8-step flow
  }, [setCurrentStep]);

  const onSubmit = (data: TekkerProfileData) => {
    updateOnboardingData({ tekkerProfile: data });
    setCurrentStep(5); // Next step is Tekker Agreement
    router.push('/agent-onboarding/tekker-agreement');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <Wrench className="h-8 w-8" /> Tekker Implementer Profile
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Highlight your implementation expertise, {onboardingData.profile?.fullName?.split(' ')[0] || 'Tekker'}. This helps match you with HeyTek 'Builds'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="primarySpecializations"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Layers className="h-5 w-5 text-primary"/>Implementation Specializations</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Select your core areas of implementation strength (select at least one).
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {implementationSpecializations.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="primarySpecializations"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20 has-[:checked]:bg-primary/5 dark:has-[:checked]:bg-primary/10 transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer flex-1">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5 text-muted-foreground"/>Years of Professional Implementation Experience</FormLabel>
                  <FormControl>
                     <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                      {experienceLevels.map((level) => (
                        <FormItem 
                          key={level} 
                          className="flex items-center space-x-2 space-y-0 p-3 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20 has-[:checked]:bg-primary/10 dark:has-[:checked]:bg-primary/20 has-[:checked]:border-primary dark:has-[:checked]:border-primary cursor-pointer transition-colors"
                        >
                          <FormControl>
                            <RadioGroupItem value={level} id={`exp-${level.replace(/\s+/g, '-')}`} />
                          </FormControl>
                          <FormLabel htmlFor={`exp-${level.replace(/\s+/g, '-')}`} className="font-normal text-xs cursor-pointer flex-1">
                            {level}
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
              name="paymentPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground"/>Preferred Payment Schedule</FormLabel>
                   <FormControl>
                     <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-3"
                    >
                      {paymentPreferences.map((pref) => (
                        <FormItem 
                          key={pref.id} 
                          className="flex items-center space-x-2 space-y-0 p-3 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20 has-[:checked]:bg-primary/10 dark:has-[:checked]:bg-primary/20 has-[:checked]:border-primary dark:has-[:checked]:border-primary cursor-pointer transition-colors"
                        >
                          <FormControl>
                            <RadioGroupItem value={pref.id} id={`payment-${pref.id}`} />
                          </FormControl>
                          <FormLabel htmlFor={`payment-${pref.id}`} className="font-normal text-xs cursor-pointer flex-1">
                            {pref.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription className="text-xs">How often you'd like accumulated task payments to be disbursed.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><LinkIcon className="h-5 w-5 text-muted-foreground"/>Implementation Showcase (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Link to GitHub, live sites, or case studies" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormDescription className="text-xs">Show off successful 'Builds' you've implemented.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="typicalBuildFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground"/>Typical Build Implementation Fee (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., '$3000-$5000 per Build', 'Fixed fee per Build'" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormDescription className="text-xs">Your general fee structure for full implementations (paid upon success).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(3); router.push('/agent-onboarding/vision');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Next: Tekker Agreement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    