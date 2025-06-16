
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { generateProductProfile, GenerateProductProfileInputSchema, type GenerateProductProfileOutput } from '@/ai/flows/generate-product-profile';
import { useState, useEffect } from 'react';
import { Archive, Edit3, Loader2, AlertTriangle, Sparkles, Wand2, Info, ClipboardCopy, Check, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { IdeaDetails } from '@/ai/flows/extract-startup-idea-flow';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
const BUSINESS_NAME_KEY = 'heytekBusinessName';
const PRODUCT_PROFILE_GENERATED_KEY = 'heytekProductProfileGenerated_v1'; // To track this step

type ProductProfileFormValues = Zod.infer<typeof GenerateProductProfileInputSchema>;

export default function ProductProfileGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProfile, setGeneratedProfile] = useState<GenerateProductProfileOutput | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProductProfileFormValues>({
    resolver: zodResolver(GenerateProductProfileInputSchema),
    defaultValues: {
      productName: '',
      startupIdeaSummary: '',
      coreFeatures: '',
      targetAudience: '',
      problemSolved: '',
      uniqueSellingProposition: '',
    },
  });

  useEffect(() => {
    const storedBusinessName = sessionStorage.getItem(BUSINESS_NAME_KEY);
    if (storedBusinessName) {
      form.setValue('productName', storedBusinessName);
    }

    const storedIdeaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    if (storedIdeaDetailsString) {
      try {
        const idea: IdeaDetails = JSON.parse(storedIdeaDetailsString);
        if (idea.summary && !idea.summary.startsWith("Let's define this core concept")) form.setValue('startupIdeaSummary', idea.summary);
        else if (idea.title && !idea.title.startsWith("A Sparkling New Vision") && !idea.title.startsWith("Sparkling New Idea")) form.setValue('startupIdeaSummary', idea.title);
        
        if (idea.solution && !idea.solution.startsWith("Let's shape the perfect solution")) {
            form.setValue('coreFeatures', `Our solution offers: [Feature 1 based on ${idea.solution.substring(0,20)}...], [Feature 2], [Feature 3]`);
        }
        if (idea.targetAudience && !idea.targetAudience.startsWith("We can pinpoint your audience")) form.setValue('targetAudience', idea.targetAudience);
        if (idea.problem && !idea.problem.startsWith("We'll identify the key problem")) form.setValue('problemSolved', idea.problem);
        if (idea.uniqueness && !idea.uniqueness.startsWith("We'll discover your unique edge")) form.setValue('uniqueSellingProposition', idea.uniqueness);

      } catch (e) {
        console.error("Error parsing idea details for product profile", e);
      }
    }
  }, [form]);

  async function onSubmit(data: ProductProfileFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedProfile(null);
    try {
      const result = await generateProductProfile(data);
      setGeneratedProfile(result);
      sessionStorage.setItem(PRODUCT_PROFILE_GENERATED_KEY, 'true'); 
      toast({
        title: "Product Profile Generated!",
        description: "Sparky has drafted a profile for your product.",
        icon: <Wand2 className="h-5 w-5 text-primary" />,
      });
    } catch (err) {
      console.error('Error generating product profile:', err);
      setError('Failed to generate profile. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate product profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [fieldName]: true }));
      toast({ title: `${fieldName.replace(/([A-Z])/g, ' $1')} Copied!`, description: "Content copied to clipboard." });
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [fieldName]: false })), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({ title: "Copy Failed", description: "Could not copy to clipboard.", variant: "destructive" });
    });
  };

  const handleProceed = () => {
    if (generatedProfile) {
      sessionStorage.setItem(PRODUCT_PROFILE_GENERATED_KEY, 'true'); // Ensure it's set
      toast({
        title: "Product Profile Ready!",
        description: "Moving on to Legal Setup...",
        icon: <Sparkles className="h-5 w-5 text-primary" />,
      });
      router.push('/legal-setup');
    } else {
        toast({
            title: "Wait a Moment!",
            description: "Please generate your product profile before proceeding.",
            variant: "default",
        });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            AI Product Profile Generator
          </CardTitle>
          <CardDescription>
            Input details about your product, and Sparky will generate a concise profile suitable for pitch decks, one-pagers, and more. Your data from previous steps might be pre-filled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <Input placeholder="Your Product's Awesome Name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startupIdeaSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">Startup Idea / Business Context
                     <Button variant="link" size="xs" className="p-0 h-auto text-primary ml-2" onClick={() => router.push('/idea-extractor')}>
                        <Edit3 className="mr-1 h-3 w-3" /> Refine Idea
                      </Button>
                    </FormLabel>
                    <Textarea placeholder="Overall summary of the business or idea." {...field} rows={3} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coreFeatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Features</FormLabel>
                    <Textarea placeholder="List 3-5 key features, e.g., AI-powered matching, real-time collaboration, automated reporting." {...field} rows={3} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Input placeholder="e.g., Busy professionals aged 25-40" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="problemSolved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Solved</FormLabel>
                      <Input placeholder="e.g., Difficulty finding reliable local services" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="uniqueSellingProposition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Selling Proposition (USP)</FormLabel>
                    <Textarea placeholder="What makes your product unique or better? e.g., First platform to use X technology for Y market." {...field} rows={2} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Profile...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Product Profile</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
         <Card className="border-destructive bg-destructive/5 dark:bg-destructive/10">
          <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Error</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      )}

      {generatedProfile && (
        <Card className="mt-6 shadow-lg border-primary/30 dark:border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">Generated Product Profile for "{form.getValues("productName")}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(generatedProfile).map(([key, value]) => {
              const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              const textToCopy = Array.isArray(value) ? value.join("\n- ") : value;
              const isCopied = copiedStates[key];
              
              return (
                <div key={key} className="space-y-1 p-3 border rounded-md bg-card dark:bg-background/30 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-accent dark:text-accent">{fieldName}</h3>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(textToCopy, fieldName)} className="text-muted-foreground hover:text-primary h-7 px-2">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                      <span className="ml-1.5 text-xs">{isCopied ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside pl-4 text-sm text-muted-foreground dark:text-foreground/80">
                      {value.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground dark:text-foreground/80 whitespace-pre-line">{value}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
           <CardFooter className="flex-col items-start gap-3">
            <p className="text-xs text-muted-foreground">This AI-generated profile is a great starting point. Refine it to perfectly match your brand voice and specific needs.</p>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button 
                    onClick={() => toast({title: "Save Feature Coming Soon!", description: "Ability to save this profile to your HeyTek materials is planned."})} 
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10 dark:hover:bg-accent/20 flex-1"
                >
                    <Archive className="mr-2 h-4 w-4" /> Save to My Materials (Mock)
                </Button>
                <Button onClick={handleProceed} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground flex-1">
                    Confirm Profile &amp; Proceed to Legal Setup <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
    
