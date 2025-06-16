
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, investorPreferencesSchema, type InvestorPreferencesData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, DollarSign, TrendingUp, Filter, Layers } from 'lucide-react';
import { useEffect } from 'react';

const sectors = [
  { id: 'ai_ml', label: 'Artificial Intelligence / Machine Learning' },
  { id: 'saas_software', label: 'SaaS / Enterprise Software' },
  { id: 'fintech', label: 'FinTech' },
  { id: 'healthtech_biotech', label: 'HealthTech / BioTech' },
  { id: 'ecommerce_marketplace', label: 'E-commerce / Marketplaces' },
  { id: 'sustainability_cleantech', label: 'Sustainability / CleanTech' },
  { id: 'deep_tech', label: 'Deep Tech / R&D Intensive' },
  { id: 'consumer_tech', label: 'Consumer Tech / Mobile Apps' },
];

const stages = [
  { id: 'pre_seed', label: 'Pre-Seed' },
  { id: 'seed', label: 'Seed Stage' },
  { id: 'series_a', label: 'Series A' },
  { id: 'growth', label: 'Growth Stage (Series B+)' },
  { id: 'any', label: 'Any Stage (Opportunistic)' },
];

export default function InvestorPreferencesPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<InvestorPreferencesData>({
    resolver: zodResolver(investorPreferencesSchema),
    defaultValues: onboardingData.investorPreferences || {
      investmentSectors: [],
      preferredStage: [],
      typicalTicketSize: '',
    },
  });

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const onSubmit = (data: InvestorPreferencesData) => {
    updateOnboardingData({ investorPreferences: data });
    setCurrentStep(5); // Next step is Investor Qualification
    router.push('/agent-onboarding/investor-qualification');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <DollarSign className="h-8 w-8" /> Investor Preferences
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Define your investment focus, {onboardingData.profile?.fullName?.split(' ')[0] || 'Investor'}. This helps us curate opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="investmentSectors"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Preferred Investment Sectors</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Which industries are you most interested in? (select at least one).
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sectors.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="investmentSectors"
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
              name="preferredStage"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Layers className="h-5 w-5 text-muted-foreground"/>Preferred Investment Stage</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                      At what stage do you typically invest? (select at least one).
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stages.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="preferredStage"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20 has-[:checked]:bg-primary/5 dark:has-[:checked]:bg-primary/10 transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id as any)} // Cast for enum
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id as any])
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
              name="typicalTicketSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-muted-foreground"/>Typical Ticket Size</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $25k - $100k, or $1M+" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormDescription className="text-xs">What's your usual investment range per startup?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(3); router.push('/agent-onboarding/vision');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Next: Investor Qualification <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    