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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { generateDueDiligenceQuestions, type GenerateDueDiligenceQuestionsInput, type GenerateDueDiligenceQuestionsOutput } from '@/ai/flows/generate-due-diligence-questions';
import { useState, useEffect } from 'react';
import { HelpCircle, Loader2, AlertTriangle, Sparkles, Wand2, Info, CornerDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as z from 'zod'; // Import Zod

// Define the schema locally in the client component
const dueDiligenceFormSchema = z.object({
  startupIndustry: z.string().min(1, "Please select the startup's industry.").describe("The industry the startup operates in (e.g., SaaS, FinTech, AgriTech)."),
  investmentStage: z.string().min(1, "Please select the investment stage.").describe("The current investment stage of the startup (e.g., Pre-seed, Seed, Series A, Growth)."),
  startupSummary: z.string().optional().describe("A brief summary of what the startup does."),
});

type DueDiligenceFormValues = GenerateDueDiligenceQuestionsInput; // This type is still valid as it's derived from the flow's internal schema

const mockIndustries = ["SaaS", "FinTech", "HealthTech", "AgriTech", "EdTech", "E-commerce", "Deep Tech", "Consumer Goods", "Web3", "Creator Economy"];
const mockStages = ["Pre-seed", "Seed", "Series A", "Growth Stage", "Late Stage"];

const STARTUP_FOR_DILIGENCE_KEY = 'startupForDueDiligence';

export default function DueDiligenceQuestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateDueDiligenceQuestionsOutput | null>(null);
  const [wasPrefilled, setWasPrefilled] = useState(false);
  const { toast } = useToast();

  const form = useForm<DueDiligenceFormValues>({
    resolver: zodResolver(dueDiligenceFormSchema), // Use the locally defined schema
    defaultValues: {
      startupIndustry: '',
      investmentStage: '',
      startupSummary: '',
    },
  });

  useEffect(() => {
    const storedStartupDataString = sessionStorage.getItem(STARTUP_FOR_DILIGENCE_KEY);
    if (storedStartupDataString) {
      try {
        const startupData: { name: string; industry: string; stage: string; summary: string; } = JSON.parse(storedStartupDataString);
        form.setValue('startupIndustry', startupData.industry || '');
        form.setValue('investmentStage', startupData.stage || '');
        form.setValue('startupSummary', `Regarding ${startupData.name}: ${startupData.summary}` || '');
        setWasPrefilled(true);
        toast({
          title: `Details for "${startupData.name}" Loaded!`,
          description: "Startup information pre-filled from your chat with Sparky.",
          icon: <CornerDownLeft className="h-5 w-5 text-primary" />
        });
        sessionStorage.removeItem(STARTUP_FOR_DILIGENCE_KEY);
      } catch (e) {
        console.error("Error parsing startup data for diligence from session storage", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, toast]); // form.setValue is stable

  async function onSubmit(data: DueDiligenceFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedQuestions(null);
    try {
      const result = await generateDueDiligenceQuestions(data);
      setGeneratedQuestions(result);
      toast({
        title: "Due Diligence Questions Generated!",
        description: "Sparky has prepared a list of questions for your review.",
        icon: <Wand2 className="h-5 w-5 text-primary" />,
      });
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate due diligence questions. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate questions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <HelpCircle className="mr-2 h-6 w-6 text-primary" />
            AI Due Diligence Question Generator
          </CardTitle>
          <CardDescription>
            Get a tailored list of questions for evaluating investment opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wasPrefilled && (
            <Alert variant="default" className="mb-4 border-primary/30 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary [&>svg]:text-primary">
              <Info className="h-4 w-4" />
              <AlertTitle>Information Pre-filled</AlertTitle>
              <AlertDescription>
                Startup details have been pre-filled from your previous interaction. Review and adjust as needed.
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="startupIndustry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {mockIndustries.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investmentStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Stage</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {mockStages.map(stage => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startupSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Summary (Optional)</FormLabel>
                    <Textarea placeholder="Briefly describe what the startup does. (e.g., an AI-powered platform for sustainable farming)" {...field} rows={3} />
                    <FormDescription>Providing a summary helps generate more specific questions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Questions...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Questions</>
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

      {generatedQuestions && (
        <Card className="mt-6 shadow-lg border-primary/30 dark:border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">Due Diligence Questions</CardTitle>
            <CardDescription>
                For a {form.getValues("investmentStage")} stage startup in the {form.getValues("startupIndustry")} industry.
                {generatedQuestions.introduction && <p className="mt-2 italic text-sm">{generatedQuestions.introduction}</p>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {generatedQuestions.questionCategories.map((category, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:text-primary dark:hover:text-primary">
                    {category.categoryName}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-decimal space-y-2 pl-6 text-muted-foreground dark:text-foreground/80">
                      {category.questions.map((question, i) => (
                        <li key={i}>{question}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {generatedQuestions.finalConsideration && (
              <div className="mt-6 p-3 bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/50 rounded-md">
                <h3 className="text-md font-semibold mb-1 flex items-center text-accent dark:text-accent"><Info className="mr-2 h-5 w-5"/>Final Consideration:</h3>
                <p className="text-sm text-muted-foreground dark:text-foreground/80">{generatedQuestions.finalConsideration}</p>
              </div>
            )}
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">This AI-generated list is a starting point. Always conduct thorough due diligence.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}