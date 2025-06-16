
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, visionSchema, type VisionData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, Target, Briefcase, CheckSquare, Lightbulb, Rocket, Code, Users, DollarSign, HelpCircle } from 'lucide-react'; 

const paths = [
  { id: 'founder_ceo', label: 'Become a Founder / CEO', icon: Rocket, color: "text-primary" },
  { id: 'tekker', label: 'Become a Tekker (Implementer/Specialist)', icon: Code, color: "text-primary" },
  { id: 'brand_consultant', label: 'Join as a Brand Consultant (Strategic Advisor)', icon: Users, color: "text-primary" },
  { id: 'investor', label: 'Invest in a Business', icon: DollarSign, color: "text-primary" },
  { id: 'other', label: 'Other (Please specify)', icon: HelpCircle, color: "text-muted-foreground" },
];

const interests = [
  { id: 'branding', label: 'Branding & Creative Strategy' },
  { id: 'structure_setup', label: 'Business Structure & Legal Setup' },
  { id: 'tech_implementation', label: 'Technology Implementation & Automation' },
  { id: 's_c_b_development', label: 'School/Church/Business Development' },
  { id: 'training_facilitation', label: 'Training & Facilitation' },
  { id: 'ai_ml_integration', label: 'AI & Machine Learning Integration'},
  { id: 'product_management', label: 'Product Management & Roadmapping'},
  { id: 'market_research', label: 'Market Research & Analysis'},
];

export default function VisionPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<VisionData>({
    resolver: zodResolver(visionSchema),
    defaultValues: onboardingData.vision || {
      path: undefined,
      customRole: '',
      areasOfInterest: [],
    },
  });

  const selectedPath = form.watch('path');

  const onSubmit = (data: VisionData) => {
    updateOnboardingData({ vision: data });
    setCurrentStep(4); 
    
    switch (data.path) {
      case 'founder_ceo':
        router.push('/agent-onboarding/founder-setup');
        break;
      case 'tekker':
        router.push('/agent-onboarding/tekker-profile');
        break;
      case 'brand_consultant':
        router.push('/agent-onboarding/consultant-focus');
        break;
      case 'investor':
        router.push('/agent-onboarding/investor-preferences');
        break;
      case 'other':
      default:
        router.push('/agent-onboarding/legal'); 
        break;
    }
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card border-border">
      <CardHeader className="border-b pb-4">
         <div className="flex items-center gap-3">
          <Target className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold font-headline text-primary dark:text-primary">
              What Brings You to HeyTek?
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground mt-1">
              Your choices here help Sparky, our AI co-pilot, tailor your journey.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5 text-muted-foreground"/>Choose Your Primary Path</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {paths.map((path) => (
                        <FormItem 
                          key={path.id} 
                          className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 has-[:checked]:bg-primary/10 dark:has-[:checked]:bg-primary/20 has-[:checked]:border-primary dark:has-[:checked]:border-primary cursor-pointer transition-all duration-200"
                        >
                          <FormControl>
                            <RadioGroupItem value={path.id} id={`path-${path.id}`} />
                          </FormControl>
                          <FormLabel htmlFor={`path-${path.id}`} className="font-normal text-sm cursor-pointer flex-1 flex items-center gap-2">
                            <path.icon className={`h-5 w-5 ${path.color || 'text-muted-foreground'} group-has-[:checked]:text-primary`} />
                            {path.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPath === 'other' && (
              <FormField
                control={form.control}
                name="customRole"
                render={({ field }) => (
                  <FormItem className="animate-slide-in">
                    <FormLabel className="font-semibold">Specify Your Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Community Manager, AI Ethicist" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="areasOfInterest"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Select Your Areas of Interest</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                      This helps us recommend relevant tools and opportunities (select at least one).
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {interests.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="areasOfInterest"
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
            
            <div className="flex justify-between items-center pt-6">
               <Button type="button" variant="outline" onClick={() => { setCurrentStep(2); router.push('/agent-onboarding/profile');}} className="border-border text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20 py-3 px-6 rounded-md">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 px-8 rounded-md shadow-md hover:shadow-lg transition-shadow">
                Next Step <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
