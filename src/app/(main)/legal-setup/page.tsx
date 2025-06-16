
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { legalSetupGuidance, type LegalSetupGuidanceOutput } from '@/ai/flows/legal-setup-guidance';
import { useState, useEffect } from 'react'; 
import { Gavel, Loader2, AlertTriangle, FileText, Code, ShieldAlert, ListChecks, MapPin, Building, UserCheck, FileBadge, SearchCheck, Sparkles, MessageSquareHeart, HelpCircle, Briefcase, Rocket, ArrowRight } from 'lucide-react';
import { CountrySelect } from '@/components/common/CountrySelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; 
import { countries } from '@/lib/countries';
import { Progress } from '@/components/ui/progress'; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IdeaDetails } from '@/ai/flows/extract-startup-idea-flow';
import type { GenerateBrandElementsOutput } from '@/ai/flows/generate-brand-elements';
import { useRouter } from 'next/navigation';


const legalSetupFormSchema = z.object({
  country: z.string().min(1, { message: 'Please select your country.' }),
  businessType: z.string().min(1, { message: 'Please select your business type.' }),
  businessIdea: z.string().min(10, { message: 'Describe your business idea (min 10 chars).' }),
  founderBackground: z.string().min(10, { message: 'Describe your background (min 10 chars).' }),
});

type LegalSetupFormValues = z.infer<typeof legalSetupFormSchema>;

const businessTypes = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Company (LLC)',
  'Private Limited Company (Ltd)',
  'Public Limited Company (PLC)',
  'S Corporation',
  'C Corporation',
  'Non-profit Organization',
  'Cooperative',
  'Other',
];

const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails'; 
const FOUNDER_BACKGROUND_KEY = 'heytekFounderBackground';
const BRAND_ELEMENTS_KEY = 'heytekBrandElements';
const LEGAL_SETUP_COMPLETED_KEY = 'heytekLegalSetupGenerated_v1';


const legalSteps = [
    {id: 1, name: "Country & Role", icon: MapPin},
    {id: 2, name: "Business Details", icon: Briefcase},
    {id: 3, name: "AI Guidance", icon: Sparkles},
    {id: 4, name: "Review & Confirm", icon: SearchCheck}
];

export default function LegalSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<LegalSetupGuidanceOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); 
  const router = useRouter();
  const userName = user?.email?.split('@')[0] || 'Founder';
  const [currentLegalStep, setCurrentLegalStep] = useState(1);

  const form = useForm<LegalSetupFormValues>({
    resolver: zodResolver(legalSetupFormSchema),
    defaultValues: {
      country: '',
      businessType: '',
      businessIdea: '',
      founderBackground: '',
    },
  });

  useEffect(() => {
    let ideaSummaryText = '';
    const storedIdeaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    if (storedIdeaDetailsString) {
      try {
        const storedIdeaDetails: IdeaDetails = JSON.parse(storedIdeaDetailsString);
        if (storedIdeaDetails?.summary && !storedIdeaDetails.summary.startsWith("Let's define this core concept") && !storedIdeaDetails.summary.startsWith("User opted to skip")) {
            ideaSummaryText = storedIdeaDetails.summary;
        } else if (storedIdeaDetails?.title && !storedIdeaDetails.title.startsWith("Sparkling New Idea")) {
            ideaSummaryText = storedIdeaDetails.title;
        }
      } catch (e) { 
          console.error("Error parsing idea details", e); 
          toast({ title: "Error", description: "Could not load idea summary.", variant: "destructive" });
      }
    }

    if (!ideaSummaryText) {
        const storedBrandElementsString = sessionStorage.getItem(BRAND_ELEMENTS_KEY);
        if (storedBrandElementsString) {
            try {
                const brandElements: GenerateBrandElementsOutput = JSON.parse(storedBrandElementsString);
                if (brandElements?.brandDescription) {
                    ideaSummaryText = brandElements.brandDescription;
                }
            } catch (e) { 
                console.error("Error parsing brand elements", e);
                toast({ title: "Error", description: "Could not load brand description.", variant: "destructive" });
            }
        }
    }
    if(ideaSummaryText) form.setValue('businessIdea', ideaSummaryText);
    

    const storedBackground = sessionStorage.getItem(FOUNDER_BACKGROUND_KEY);
    if (storedBackground && !storedBackground.startsWith("We can explore your unique angle")) {
      form.setValue('founderBackground', storedBackground);
    } else {
        // Default founder background if not found
        form.setValue('founderBackground', "A passionate entrepreneur with a vision to innovate in their chosen field.");
    }


    if (user?.country) {
      form.setValue('country', user.country);
    }
    setCurrentLegalStep(2); 
  }, [form, user, toast]);

  async function onSubmit(data: LegalSetupFormValues) {
    setIsLoading(true);
    setError(null);
    setGuidance(null);
    setCurrentLegalStep(3); 
    try {
      const result = await legalSetupGuidance({...data, userName});
      setGuidance(result);
      sessionStorage.setItem(LEGAL_SETUP_COMPLETED_KEY, 'true');
      toast({
        title: "Legal Guidance Generated!",
        description: "Review the AI-powered legal information below.",
        icon: <Sparkles className="h-5 w-5 text-primary"/>
      });
      setCurrentLegalStep(4); 
    } catch (err) {
      console.error('Error generating legal guidance:', err);
      setError('Failed to generate legal guidance. Please try again.');
       toast({
        title: "Error",
        description: "Failed to generate legal guidance. Please try again.",
        variant: "destructive",
      });
      setCurrentLegalStep(2); 
    } finally {
      setIsLoading(false);
    }
  }

  const handleProceedToPitchDeck = () => {
    if (guidance) {
      sessionStorage.setItem(LEGAL_SETUP_COMPLETED_KEY, 'true');
      toast({
        title: "Legal Setup Confirmed!",
        description: "Proceeding to Pitch Deck Outline Generation.",
        icon: <Rocket className="h-5 w-5 text-primary" />,
      });
      router.push('/pitch-deck-generator');
    } else {
        toast({
            title: "Hold on!",
            description: "Please generate legal guidance before proceeding.",
            variant: "default",
        });
    }
  };


  const currentCountryValue = form.watch('country');
  const currentCountryName = countries.find(c => c.code === currentCountryValue)?.name || currentCountryValue || "your country";
  const progressPercentage = (currentLegalStep / legalSteps.length) * 100;

  return (
    <TooltipProvider>
    <div className="space-y-6">
       <Card className="shadow-lg sticky top-20 z-10 bg-card/90 backdrop-blur-sm"> 
        <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
                <Gavel className="mr-2 h-6 w-6 text-primary" />
                Legal Setup Journey for {userName}
            </CardTitle>
            <CardDescription>Navigating the legal landscape, step by step. Your progress: {currentLegalStep} of {legalSteps.length}</CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progressPercentage} className="w-full h-2 [&>div]:bg-primary transition-all duration-500" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {legalSteps.map(step => (
                    <div key={step.id} className={`text-center ${currentLegalStep >= step.id ? 'text-primary font-semibold' : ''}`}>
                        <step.icon className={`mx-auto mb-1 h-5 w-5 ${currentLegalStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        {step.name}
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <UserCheck className="mr-2 h-6 w-6 text-primary" />
            Your Business Details
          </CardTitle>
          <CardDescription>
            Help Sparky understand your setup. Your details may be pre-filled.
            {user?.country && ` We've pre-selected ${countries.find(c=>c.code === user.country)?.name || user.country} based on your profile.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Country of Registration
                         <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><HelpCircle size={14}/></Button></TooltipTrigger>
                            <TooltipContent><p className="text-xs">This helps us tailor legal suggestions.</p></TooltipContent>
                         </Tooltip>
                      </FormLabel>
                      <CountrySelect
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-muted-foreground"/>
                        Preferred Business Structure
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><HelpCircle size={14}/></Button></TooltipTrigger>
                            <TooltipContent><p className="text-xs">Your initial thought on structure. AI will also recommend.</p></TooltipContent>
                         </Tooltip>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="businessIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Idea Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe your business, its products/services, and target market."
                        className="min-h-[100px] focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="founderBackground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder&apos;s Background/Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe the founder(s) background relevant to this venture."
                        className="min-h-[80px] focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sparky is thinking for {currentCountryName}...
                  </>
                ) : (
                  `Get AI Legal Guidance for ${currentCountryName}`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle />Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {guidance && (
        <Card className="mt-6 shadow-xl border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2 text-primary">
                <Sparkles size={24}/> AI Legal Insights for {currentCountryName}
            </CardTitle>
             <CardDescription>Here&apos;s what Sparky suggests for your venture, {userName}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {guidance.recommendedStructure && (
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-accent"><Building className="mr-2 h-5 w-5"/>Recommended Structure</h3>
                    <p className="text-muted-foreground p-3 bg-accent/10 rounded-md border border-accent/20">{guidance.recommendedStructure}</p>
                </div>
            )}
            <Separator/>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-accent"><ListChecks className="mr-2 h-5 w-5"/>Legal Checklist</h3>
              <div className="text-muted-foreground p-3 bg-accent/10 rounded-md border border-accent/20 space-y-1">
                {guidance.legalChecklist.split('\n').map((item, index) => item.trim() && <p key={index} className="text-sm leading-relaxed">{item.trim().replace(/^\s*-\s*/, '• ')}</p>)}
              </div>
            </div>
            <Separator/>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-accent"><FileBadge className="mr-2 h-5 w-5"/>Documentation Drafts/Templates</h3>
              <p className="text-muted-foreground whitespace-pre-wrap p-3 bg-accent/10 rounded-md border border-accent/20">{guidance.documentationTemplates}</p>
            </div>
            <Separator/>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-accent"><Code className="mr-2 h-5 w-5"/>Compliance Snippets (Example)</h3>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap p-3 bg-black/80 rounded-md text-white font-mono max-h-40 overflow-auto">{guidance.codeSnippets}</pre>
            </div>

            <Separator />
             <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-accent"><SearchCheck className="mr-2 h-5 w-5"/>Document Review (Mock)</h3>
                <div className="p-4 border border-dashed rounded-md text-center bg-muted/30 hover:border-primary transition-colors">
                    <p className="text-sm text-muted-foreground mb-2">Want a quick scan of your documents? Upload and Sparky will give it a look! (Feature coming soon)</p>
                    <Button variant="outline" disabled><FileText className="mr-2 h-4 w-4"/>Upload Document (Mock)</Button>
                </div>
            </div>
            
            <Separator />
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-accent"><MessageSquareHeart className="mr-2 h-5 w-5"/>Need a Legal Partner? (Mock)</h3>
                <div className="p-4 bg-secondary/30 rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Sparky has some top legal tech recommendations for {currentCountryName}! (Feature coming soon)</p>
                    <Button variant="secondary" disabled>Find Legal Partners (Mock)</Button>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex-col items-start space-y-3">
            <div className="text-xs text-destructive/80 p-3 rounded-md border border-destructive/30 bg-destructive/5 flex items-start gap-2 w-full">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0"/> 
                <p><strong className="font-semibold">Disclaimer:</strong> {guidance.disclaimer}</p>
            </div>
            <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white text-lg" onClick={handleProceedToPitchDeck}> 
                Confirm Guidance &amp; Proceed to Pitch Deck <ArrowRight className="ml-2 h-5 w-5"/>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
    </TooltipProvider>
  );
}
