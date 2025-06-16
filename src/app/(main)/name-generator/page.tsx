
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { generateBusinessName, type GenerateBusinessNameOutput } from '@/ai/flows/generate-business-name';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, XCircle, Edit3, Search, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { IdeaDetails } from '@/ai/flows/extract-startup-idea-flow';

const nameCheckerFormSchema = z.object({
  startupIdea: z.string().min(10, {
    message: 'Please describe your startup idea in at least 10 characters.',
  }),
  customNameToCheck: z.string().optional(), 
  domainAvailabilityCheck: z.boolean().default(false).optional(),
});

type NameCheckerFormValues = z.infer<typeof nameCheckerFormSchema>;

const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
const BUSINESS_NAME_KEY = 'heytekBusinessName'; 

export default function NameCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNames, setGeneratedNames] = useState<GenerateBusinessNameOutput | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null); 
  const [preFilledName, setPreFilledName] = useState<string | null>(null); 
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NameCheckerFormValues>({
    resolver: zodResolver(nameCheckerFormSchema),
    defaultValues: {
      startupIdea: '',
      customNameToCheck: '',
      domainAvailabilityCheck: true,
    },
  });

  useEffect(() => {
    const storedIdeaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    if (storedIdeaDetailsString) {
      try {
        const storedIdeaDetails: IdeaDetails = JSON.parse(storedIdeaDetailsString);
        if (storedIdeaDetails?.summary && !storedIdeaDetails.summary.startsWith("Let's define this core concept")) {
          form.setValue('startupIdea', storedIdeaDetails.summary);
        } else if (storedIdeaDetails?.title && !storedIdeaDetails.title.startsWith("Sparkling New Idea")) {
           form.setValue('startupIdea', storedIdeaDetails.title);
        }
      } catch (e) {
        console.error("Error parsing idea details from session storage", e);
        toast({ title: "Error", description: "Could not load previous idea details.", variant: "destructive" });
      }
    }

    const nameFromIdeaExtractor = sessionStorage.getItem(BUSINESS_NAME_KEY);
    if (nameFromIdeaExtractor) {
      setPreFilledName(nameFromIdeaExtractor);
      setSelectedName(nameFromIdeaExtractor); 
      form.setValue('customNameToCheck', nameFromIdeaExtractor);
    }
  }, [form, toast]);

  async function onGenerateSubmit(data: NameCheckerFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedNames(null);
    try {
      const result = await generateBusinessName({startupIdea: data.startupIdea, domainAvailabilityCheck: data.domainAvailabilityCheck || false });
      setGeneratedNames(result);
      toast({
        title: "Names Generated!",
        description: "Review the suggestions or check your own name.",
      });
    } catch (err) {
      console.error('Error generating names:', err);
      setError('Failed to generate names. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate business names. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectAndProceed = (name: string) => {
    sessionStorage.setItem(BUSINESS_NAME_KEY, name); 
    toast({
      title: `"${name}" Confirmed!`,
      description: "Excellent! Let's move on to crafting your brand identity.",
      icon: <Sparkles className="h-5 w-5 text-primary" />,
    });
    router.push('/brand-generator');
  };

  const currentNameToDisplay = form.watch('customNameToCheck') || selectedName;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            Name Checker & Suggestions
          </CardTitle>
          <CardDescription>
            Your startup idea is pre-filled. Check a name you have in mind, or let our AI suggest some creative options. Domain check is a mock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerateSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="startupIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Startup Idea Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A platform that connects local artists with coffee shops for exhibitions."
                        className="min-h-[100px] focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1">
                      The clearer the idea, the better the names! 
                      <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:underline" onClick={() => router.push('/idea-extractor')}>
                        <Edit3 className="mr-1 h-3 w-3" /> Refine Idea
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customNameToCheck"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Check a Specific Name (Optional)</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="Enter name to check, e.g., MyAwesomeStartup" {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedName(e.target.value); 
                          }}
                        />
                      </FormControl>
                       <Button type="button" variant="outline" onClick={() => setSelectedName(field.value)} disabled={!field.value} className="shrink-0">
                         <Search className="mr-2 h-4 w-4"/> Check
                       </Button>
                    </div>
                    <FormDescription>Enter a name here to see mock availability checks below.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domainAvailabilityCheck"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Show .com Domain Availability for Suggestions (Mock)
                      </FormLabel>
                      <FormDescription>
                        Verify if AI-suggested names are available as .com domains.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Brainstorming AI Names...
                  </>
                ) : (
                  'Suggest Names with AI'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {currentNameToDisplay && (
        <Card className="mt-6 shadow-md border-accent/30">
          <CardHeader>
            <CardTitle className="text-xl">Checking: "{currentNameToDisplay}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="font-medium">{currentNameToDisplay.toLowerCase().replace(/\s+/g, '')}.com</span>
              {Math.random() > 0.5 ? ( 
                <span className="text-xs text-green-600 flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50 dark:text-green-300">
                  <CheckCircle2 size={14} /> Available!
                </span>
              ) : (
                <span className="text-xs text-red-600 flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 dark:text-red-300">
                  <XCircle size={14} /> Taken
                </span>
              )}
            </div>
             <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="font-medium">IG: @{currentNameToDisplay.toLowerCase().replace(/\s+/g, '')}</span>
              {Math.random() > 0.3 ? ( 
                <span className="text-xs text-green-600 flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50 dark:text-green-300">
                  <CheckCircle2 size={14} /> Available!
                </span>
              ) : (
                 <span className="text-xs text-red-600 flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 dark:text-red-300">
                  <XCircle size={14} /> Taken
                </span>
              )}
            </div>
             <p className="text-xs text-muted-foreground">Domain and social handle checks are illustrative mocks.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSelectAndProceed(currentNameToDisplay)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Use "{currentNameToDisplay}" & Proceed <ExternalLink className="ml-2 h-4 w-4"/>
            </Button>
          </CardFooter>
        </Card>
      )}


      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle />Error Generating Names</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {generatedNames && generatedNames.businessNames.length > 0 && (
        <Card className="mt-6 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-headline">AI Suggested Names</CardTitle>
            <CardDescription>Click on a name to select it, see mock checks, and proceed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedNames.businessNames.map((name, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`p-4 h-auto justify-between items-center text-left text-base hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 ${selectedName === name ? 'bg-primary/20 border-primary ring-2 ring-primary text-primary font-semibold' : 'border-input hover:bg-primary/5 hover:border-primary/50'}`}
                  onClick={() => {
                    setSelectedName(name);
                    form.setValue('customNameToCheck', name); 
                  }}
                >
                  <span className="flex-1">{name}</span>
                  {form.getValues("domainAvailabilityCheck") && generatedNames.domainAvailability && ( 
                    generatedNames.domainAvailability[index] ? (
                      <span className="text-xs text-green-600 flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50 dark:text-green-300">
                        <CheckCircle2 size={14} /> .com Free!
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 dark:text-red-300">
                        <XCircle size={14} /> .com Taken
                      </span>
                    )
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
       {generatedNames && generatedNames.businessNames.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-center py-4">Hmm, the AI couldn't come up with names for this. Try refining your idea description or generating again!</p>
       )}
    </div>
  );
}
