
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, consultantFocusSchema, type ConsultantFocusData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Brain, Target, Building2 } from 'lucide-react';
import { useEffect } from 'react';

const expertiseAreas = [
  { id: 'brand_strategy', label: 'Brand Strategy & Positioning' },
  { id: 'market_research', label: 'Market Research & Analysis' },
  { id: 'digital_marketing', label: 'Digital Marketing & SEO' },
  { id: 'content_creation', label: 'Content Creation & Storytelling' },
  { id: 'business_development', label: 'Business Development & Sales Strategy' },
  { id: 'ai_integration_consulting', label: 'AI Integration Consulting' },
  { id: 'operational_efficiency', label: 'Operational Efficiency' },
  { id: 'change_management', label: 'Change Management' },
];

const industries = [
  { id: 'tech_saas', label: 'Technology / SaaS' },
  { id: 'ecommerce_retail', label: 'E-commerce / Retail' },
  { id: 'healthcare_wellness', label: 'Healthcare & Wellness' },
  { id: 'finance_fintech', label: 'Finance / FinTech' },
  { id: 'education_edtech', label: 'Education / EdTech' },
  { id: 'non_profit', label: 'Non-profit Sector' },
  { id: 'creative_media', label: 'Creative & Media' },
  { id: 'manufacturing_logistics', label: 'Manufacturing & Logistics' },
];

export default function ConsultantFocusPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<ConsultantFocusData>({
    resolver: zodResolver(consultantFocusSchema),
    defaultValues: onboardingData.consultantFocus || {
      expertiseAreas: [],
      targetIndustries: [],
      consultingApproach: '',
    },
  });

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const onSubmit = (data: ConsultantFocusData) => {
    updateOnboardingData({ consultantFocus: data });
    setCurrentStep(5); // Next step is Consultant Agreement
    router.push('/agent-onboarding/consultant-agreement');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <Users className="h-8 w-8" /> Brand Consultant Focus
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Define your consulting niche, {onboardingData.profile?.fullName?.split(' ')[0] || 'Consultant'}. This helps businesses find you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="expertiseAreas"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/>Areas of Expertise</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Select your primary consulting strengths (select at least one).
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {expertiseAreas.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="expertiseAreas"
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
              name="targetIndustries"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground"/>Target Industries (Optional)</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Do you specialize in any particular industries?
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {industries.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="targetIndustries"
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
              name="consultingApproach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-muted-foreground"/>Your Consulting Approach</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Briefly describe your methodology, philosophy, or unique selling points (min. 20 characters)." 
                        {...field} 
                        className="dark:bg-input dark:text-foreground text-base min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">What makes your consulting style effective?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(3); router.push('/agent-onboarding/vision');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Next: Consultant Agreement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    