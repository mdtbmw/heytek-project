
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
import { generateBrandVoice, type GenerateBrandVoiceInput, type GenerateBrandVoiceOutput } from '@/ai/flows/generate-brand-voice';
import { useState } from 'react';
import { Mic, Loader2, AlertTriangle, Sparkles, Wand2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const brandVoiceFormSchema = GenerateBrandVoiceInputSchema;
type BrandVoiceFormValues = GenerateBrandVoiceInput;

export default function BrandVoiceToolPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVoices, setGeneratedVoices] = useState<GenerateBrandVoiceOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<BrandVoiceFormValues>({
    resolver: zodResolver(brandVoiceFormSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      coreIdeaOrMission: '',
      targetAudienceDescription: '',
    },
  });

  async function onSubmit(data: BrandVoiceFormValues) {
    setIsLoading(true);
    setError(null);
    setGeneratedVoices(null);
    try {
      const result = await generateBrandVoice(data);
      setGeneratedVoices(result);
      toast({
        title: "Brand Voice Archetypes Generated!",
        description: "Sparky has crafted some voice suggestions for your client.",
        icon: <Wand2 className="h-5 w-5 text-primary" />,
      });
    } catch (err) {
      console.error('Error generating brand voices:', err);
      setError('Failed to generate brand voice archetypes. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate brand voice suggestions.",
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
            <Mic className="mr-2 h-6 w-6 text-primary" />
            AI Brand Voice Generator
          </CardTitle>
          <CardDescription>
            Help your client define their brand's personality. Input their company details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Company Name</FormLabel>
                    <Input placeholder="e.g., Bloom & Grow Florists" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Input placeholder="e.g., Retail, SaaS, Eco-friendly products" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coreIdeaOrMission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Idea or Mission</FormLabel>
                    <Textarea placeholder="What is the client's main goal or unique selling proposition?" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudienceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience (Optional)</FormLabel>
                    <Textarea placeholder="Briefly describe who they are trying to reach." {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Voices...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Voice Archetypes</>
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

      {generatedVoices && (
        <Card className="mt-6 shadow-lg border-primary/30 dark:border-primary/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">Suggested Brand Voice Archetypes</CardTitle>
            {generatedVoices.rationale && <CardDescription>{generatedVoices.rationale}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedVoices.suggestedArchetypes.map((archetype, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card dark:bg-background/30 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-accent dark:text-accent mb-1">{archetype.archetypeName}</h3>
                <p className="text-sm text-muted-foreground dark:text-foreground/80 mb-2">{archetype.description}</p>
                <div className="mb-2">
                  <span className="text-xs font-semibold">Keywords: </span>
                  {archetype.keywords.map(kw => <Badge key={kw} variant="secondary" className="mr-1">{kw}</Badge>)}
                </div>
                <p className="text-sm italic text-muted-foreground dark:text-foreground/70">"{archetype.exampleSentence}"</p>
              </div>
            ))}
            
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">Use these AI-generated archetypes as a starting point for client discussions.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
    