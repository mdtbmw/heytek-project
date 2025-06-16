
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
import { generatePitchDeckOutline, type GeneratePitchDeckOutlineInput, type GeneratePitchDeckOutlineOutput } from '@/ai/flows/generate-pitch-deck-outline';
import { useState, useEffect } from 'react';
import { Presentation, Loader2, AlertTriangle, Sparkles, Wand2, Info, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { IdeaDetails } from '@/ai/flows/extract-startup-idea-flow';
import { useRouter } from 'next/navigation';


const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
const PITCH_DECK_GENERATED_KEY = 'heytekPitchDeckGenerated_v1';

const pitchDeckGeneratorFormSchema = GeneratePitchDeckOutlineInputSchema; // Use schema from flow
type PitchDeckGeneratorFormValues = GeneratePitchDeckOutlineInput;

export default function PitchDeckGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<GeneratePitchDeckOutlineOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();


  const form = useForm<PitchDeckGeneratorFormValues>({
    resolver: zodResolver(pitchDeckGeneratorFormSchema),
    defaultValues: {
      startupIdea: '',
      problem: '',
      solution: '',
      targetAudience: '',
      businessModel: '',
      teamOverview: '',
    },
  });

  useEffect(() => {
    const storedIdeaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    if (storedIdeaDetailsString) {
      try {
        const storedIdeaDetails: IdeaDetails = JSON.parse(storedIdeaDetailsString);
        if (storedIdeaDetails.summary && !storedIdeaDetails.summary.startsWith("Let's define this core concept")) form.setValue('startupIdea', storedIdeaDetails.summary);
        if (storedIdeaDetails.problem && !storedIdeaDetails.problem.startsWith("We'll identify the key problem")) form.setValue('problem', storedIdeaDetails.problem);
        if (storedIdeaDetails.solution && !storedIdeaDetails.solution.startsWith("Let's shape the perfect solution")) form.setValue('solution', storedIdeaDetails.solution);
        if (storedIdeaDetails.targetAudience && !storedIdeaDetails.targetAudience.startsWith("We can pinpoint your audience")) form.setValue('targetAudience', storedIdeaDetails.targetAudience);
        if (storedIdeaDetails.revenueModel && !storedIdeaDetails.revenueModel.startsWith("How will this make money")) form.setValue('businessModel', storedIdeaDetails.revenueModel);
        // Team overview is harder to prefill without a specific source yet.
      } catch (e) {
        console.error("Error parsing idea details from session storage", e);
      }
    }
  }, [form]);

  async function onSubmit(data: PitchDeckGeneratorFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedOutline(null);
    try {
      const result = await generatePitchDeckOutline(data);
      setGeneratedOutline(result);
      sessionStorage.setItem(PITCH_DECK_GENERATED_KEY, 'true');
      toast({
        title: "Pitch Deck Outline Generated!",
        description: "Your AI-crafted pitch deck structure is ready.",
        icon: <Wand2 className="h-5 w-5 text-primary" />,
      });
    } catch (err) {
      console.error('Error generating pitch deck outline:', err);
      setError('Failed to generate outline. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate pitch deck outline.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleProceed = () => {
    if (generatedOutline) {
      sessionStorage.setItem(PITCH_DECK_GENERATED_KEY, 'true');
      toast({
        title: "Pitch Deck Outline Confirmed!",
        description: "You're making great progress! Returning to Dashboard.",
        icon: <Sparkles className="h-5 w-5 text-primary" />,
      });
      router.push('/dashboard');
    } else {
        toast({
            title: "Hold Up!",
            description: "Please generate your pitch deck outline first.",
            variant: "default",
        });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Presentation className="mr-2 h-6 w-6 text-primary" />
            AI Pitch Deck Outline Generator
          </CardTitle>
          <CardDescription>
            Provide details about your startup, and Sparky will help craft a compelling pitch deck outline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="startupIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Idea Summary</FormLabel>
                    <Textarea placeholder="The core concept of your venture." {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem You Solve</FormLabel>
                      <Input placeholder="What pain point are you addressing?" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Solution</FormLabel>
                      <Input placeholder="How do you solve this problem?" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Input placeholder="Who are your primary customers?" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model (Optional)</FormLabel>
                    <Input placeholder="How will your startup make money?" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamOverview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Overview (Optional)</FormLabel>
                    <Textarea placeholder="Briefly describe key team members and their strengths/roles." {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Outline...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Outline</>
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

      {generatedOutline && (
        <Card className="mt-6 shadow-lg border-primary/30 dark:border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">{generatedOutline.deckTitleSuggestion || "Your Pitch Deck Outline"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {generatedOutline.slides.map((slide, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:text-primary dark:hover:text-primary">
                    {index + 1}. {slide.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-6 text-muted-foreground dark:text-foreground/80">
                      {slide.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {generatedOutline.additionalTips && generatedOutline.additionalTips.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center text-accent dark:text-accent"><Info className="mr-2 h-5 w-5"/>Additional Tips:</h3>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground dark:text-foreground/80">
                  {generatedOutline.additionalTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
           <CardFooter className="flex-col items-start gap-3">
             <p className="text-xs text-muted-foreground">This is an AI-generated starting point. Tailor it to your unique story!</p>
              <Button onClick={handleProceed} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                Confirm Outline &amp; Go to Dashboard <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
    
