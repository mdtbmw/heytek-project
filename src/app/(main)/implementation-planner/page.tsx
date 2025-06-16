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
import { generateImplementationPlan, type GenerateImplementationPlanInput, type GenerateImplementationPlanOutput } from '@/ai/flows/generate-implementation-plan';
import { useState, useEffect } from 'react'; // Added useEffect
import { ListChecks, Loader2, AlertTriangle, Sparkles, Wand2, Info, CornerDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

const implementationPlannerFormSchema = z.object({
  buildTitle: z.string().min(1, "Build title is required.").describe("The title of the HeyTek Build to be implemented."),
  buildDescription: z.string().min(10, "Description must be at least 10 characters.").describe("A summary of the Build, including its core purpose and key features expected."),
  keyTechnologies: z.array(z.string()).optional().describe("Known key technologies or platforms to be used (e.g., Next.js, Firebase, Genkit)."),
});

type ImplementationPlannerFormValues = GenerateImplementationPlanInput;

const TEKKER_PLAN_FOR_PLANNER_KEY = 'tekkerPlanForPlanner';

export default function ImplementationPlannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateImplementationPlanOutput | null>(null);
  const [wasPrefilled, setWasPrefilled] = useState(false);
  const { toast } = useToast();

  const form = useForm<ImplementationPlannerFormValues>({
    resolver: zodResolver(implementationPlannerFormSchema),
    defaultValues: {
      buildTitle: '',
      buildDescription: '',
      keyTechnologies: [],
    },
  });

  useEffect(() => {
    const planSummaryFromTekkerChat = sessionStorage.getItem(TEKKER_PLAN_FOR_PLANNER_KEY);
    if (planSummaryFromTekkerChat) {
      form.setValue('buildDescription', planSummaryFromTekkerChat);
      setWasPrefilled(true);
      toast({
        title: "Plan Details Loaded!",
        description: "Build description pre-filled from your Tekker Chat session.",
        icon: <CornerDownLeft className="h-5 w-5 text-primary" />
      });
      sessionStorage.removeItem(TEKKER_PLAN_FOR_PLANNER_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, toast]); // form.setValue is stable, toast is stable

  async function onSubmit(data: ImplementationPlannerFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    try {
      const result = await generateImplementationPlan(data);
      setGeneratedPlan(result);
      toast({
        title: "Implementation Plan Generated!",
        description: "Sparky has outlined a high-level plan based on your Build's details.",
        icon: <Wand2 className="h-5 w-5 text-primary" />,
      });
    } catch (err) {
      console.error('Error generating implementation plan:', err);
      setError('Failed to generate plan. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate implementation plan.",
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
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            AI Implementation Plan Assistant
          </CardTitle>
          <CardDescription>
            Input the details of the HeyTek 'Build' you are planning to implement. Sparky will generate a high-level technical plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wasPrefilled && (
            <Alert className="mb-4 border-primary/30 bg-primary/10 text-primary [&>svg]:text-primary">
              <Info className="h-4 w-4" />
              <AlertTriangle />
              <AlertDescription>
                The Build Description below was pre-filled from your Tekker Chat Assistant session. Please review and add a Build Title.
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="buildTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Build Title</FormLabel>
                    <Input placeholder="Enter the exact title of the HeyTek Build" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buildDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Build Description</FormLabel>
                    <Textarea placeholder="Summarize the Build's purpose and key features as provided in the Build specifications." {...field} rows={4}/>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keyTechnologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Technologies (Optional, comma-separated)</FormLabel>
                    <Input 
                      placeholder="e.g., Next.js, Firebase, Stripe (if known or specified)" 
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()).filter(item => item))}
                    />
                    <FormDescription>List known technologies to help tailor the plan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Plan</>
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

      {generatedPlan && (
        <Card className="mt-6 shadow-lg border-primary/30 dark:border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">{generatedPlan.planTitle || "Implementation Plan"}</CardTitle>
            <CardDescription>For Build: "{form.getValues("buildTitle")}"</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {generatedPlan.phases.map((phase, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:text-primary dark:hover:text-primary">
                    {index + 1}. {phase.phaseName} 
                    {phase.estimatedDuration && <Badge variant="secondary" className="ml-2">{phase.estimatedDuration}</Badge>}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Key Tasks:</h4>
                        <ul className="list-disc space-y-1 pl-5 text-muted-foreground dark:text-foreground/80 text-sm">
                        {phase.keyTasks.map((task, i) => (
                            <li key={i}>
                                <strong>{task.taskName}</strong>
                                {task.taskDescription && <p className="text-xs pl-2 italic">{task.taskDescription}</p>}
                            </li>
                        ))}
                        </ul>
                    </div>
                    {phase.potentialChallenges && phase.potentialChallenges.length > 0 && (
                         <div>
                            <h4 className="font-semibold text-sm mb-1">Potential Challenges:</h4>
                            <ul className="list-disc space-y-1 pl-5 text-muted-foreground dark:text-foreground/80 text-sm">
                            {phase.potentialChallenges.map((challenge, i) => (
                                <li key={i}>{challenge}</li>
                            ))}
                            </ul>
                        </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {generatedPlan.overallConsiderations && generatedPlan.overallConsiderations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center text-accent dark:text-accent"><Info className="mr-2 h-5 w-5"/>Overall Considerations:</h3>
                <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground dark:text-foreground/80">
                  {generatedPlan.overallConsiderations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">This AI-generated plan is a starting point. Adapt it to the specific Build requirements and HeyTek's official guidelines.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
