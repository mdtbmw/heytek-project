
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { generateBrandElements, type GenerateBrandElementsOutput } from '@/ai/flows/generate-brand-elements';
import { useState, useEffect } from 'react';
import { Palette, Loader2, AlertTriangle, Quote, VenetianMask, Eye, Target, Sparkles, Edit3, ArrowRight, Brush, Fingerprint } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { IdeaDetails } from '@/ai/flows/extract-startup-idea-flow';


const brandGeneratorFormSchema = z.object({
  startupIdea: z.string().min(10, {
    message: 'Please describe your startup idea in at least 10 characters.',
  }),
});

type BrandGeneratorFormValues = z.infer<typeof brandGeneratorFormSchema>;

const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails'; 
const BUSINESS_NAME_KEY = 'heytekBusinessName';
const BRAND_TAGLINE_KEY = 'heytekBrandTagline'; 
const BRAND_ELEMENTS_KEY = 'heytekBrandElements';
const PRODUCT_PROFILE_GENERATED_KEY = 'heytekProductProfileGenerated_v1'; // To track this step


export default function BrandGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandElements, setBrandElements] = useState<GenerateBrandElementsOutput | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BrandGeneratorFormValues>({
    resolver: zodResolver(brandGeneratorFormSchema),
    defaultValues: {
      startupIdea: '',
    },
  });

  useEffect(() => {
    let ideaContext = '';
    const storedIdeaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    if (storedIdeaDetailsString) {
      try {
        const storedIdeaDetails: IdeaDetails = JSON.parse(storedIdeaDetailsString);
        if (storedIdeaDetails?.summary && !storedIdeaDetails.summary.startsWith("Let's define this core concept") && !storedIdeaDetails.summary.startsWith("User opted to skip")) {
          ideaContext = storedIdeaDetails.summary;
        } else if (storedIdeaDetails?.title && !storedIdeaDetails.title.startsWith("Sparkling New Idea")) {
            ideaContext = storedIdeaDetails.title; 
        }
      } catch (e) { 
        console.error("Error parsing idea details", e); 
        toast({ title: "Error", description: "Could not load previous idea context.", variant: "destructive" });
      }
    }
    
    const storedName = sessionStorage.getItem(BUSINESS_NAME_KEY);
    if (storedName) {
      setSelectedBusinessName(storedName);
    }

    const storedBrandElementsString = sessionStorage.getItem(BRAND_ELEMENTS_KEY);
    if (storedBrandElementsString) {
        try {
            const prevBrandElements = JSON.parse(storedBrandElementsString);
            setBrandElements(prevBrandElements);
            if ((!ideaContext || ideaContext.startsWith("Let's define this core concept")) && prevBrandElements?.brandDescription) {
                ideaContext = prevBrandElements.brandDescription;
            }
        } catch (e) { 
          console.error("Error parsing existing brand elements", e);
          toast({ title: "Error", description: "Could not load previous brand elements.", variant: "destructive" });
        }
    } else {
      const storedTagline = sessionStorage.getItem(BRAND_TAGLINE_KEY);
      if (storedTagline && (!brandElements || !brandElements.taglines?.includes(storedTagline))) { 
        setBrandElements(prev => ({
          ...(prev || { visionStatement: '', missionStatement: '', brandDescription: '', asciiLogo: '', colorPaletteSuggestion: '' }),
          taglines: prev?.taglines ? [...new Set([storedTagline, ...prev.taglines])] : [storedTagline], 
        }));
      }
    }
    if(ideaContext) form.setValue('startupIdea', ideaContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, toast]); 

  async function onSubmit(data: BrandGeneratorFormValues) {
    setIsLoading(true);
    setError(null);
    setBrandElements(null); 
    try {
      const result = await generateBrandElements({startupIdea: data.startupIdea, businessName: selectedBusinessName || undefined});
      setBrandElements(result);
      sessionStorage.setItem(BRAND_ELEMENTS_KEY, JSON.stringify(result));
      toast({
        title: "Brand Elements Generated!",
        description: "Your AI-crafted brand identity is ready. Review and proceed.",
      });
    } catch (err) {
      console.error('Error generating brand elements:', err);
      setError('Failed to generate brand elements. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate brand elements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleProceed = () => {
    if (brandElements && (brandElements.taglines?.length > 0 || brandElements.visionStatement || brandElements.missionStatement || brandElements.brandDescription)) {
      sessionStorage.setItem(BRAND_ELEMENTS_KEY, JSON.stringify(brandElements));
      
      toast({
        title: "Brand Identity Solidified!",
        description: "Moving on to Product/Service Profile...",
        icon: <Sparkles className="h-5 w-5 text-primary" />,
      });
      router.push('/product-profile-generator'); // Updated to go to product profile generator
    } else {
      toast({
        title: "Hold on!",
        description: "Please generate or confirm brand elements before proceeding.",
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Brush className="mr-2 h-6 w-6 text-primary" />
            AI Brand Elements Generator
          </CardTitle>
          {selectedBusinessName && (
            <CardDescription className="text-lg text-primary">
              For: <strong>{selectedBusinessName}</strong>
            </CardDescription>
          )}
          <CardDescription>
            Your startup idea summary should be pre-filled. Sparky will generate taglines, vision/mission statements, a brand description, an ASCII logo, and color palette ideas.
            {sessionStorage.getItem(BRAND_TAGLINE_KEY) && !sessionStorage.getItem(BRAND_ELEMENTS_KEY) && " An initial tagline may have been suggested by Sparky earlier!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="startupIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Startup Idea / Brand Core</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., An eco-friendly subscription box for zero-waste home products."
                        className="min-h-[100px] focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription className="space-x-2">
                      <span>A clear idea helps Sparky generate better brand elements.</span>
                      <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={() => router.push('/idea-extractor')}>
                        <Edit3 className="mr-1 h-3 w-3" /> Refine Idea
                      </Button>
                       <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={() => router.push('/name-generator')}>
                        <Edit3 className="mr-1 h-3 w-3" /> Change Name
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sparky is Creating...
                  </>
                ) : (
                  brandElements && Object.values(brandElements).some(v => Array.isArray(v) ? v.length > 0 : !!v) ? 'Regenerate Brand Elements' : 'Generate Brand Elements'
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

      {brandElements && (brandElements.taglines?.length > 0 || brandElements.visionStatement || brandElements.missionStatement || brandElements.brandDescription || brandElements.asciiLogo || brandElements.colorPaletteSuggestion) && (
        <Card className="mt-6 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Generated Brand Elements for "{selectedBusinessName || 'Your Startup'}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {brandElements.asciiLogo && (
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-primary"><Fingerprint className="mr-2 h-5 w-5"/>ASCII/Emoji Logo Sketch</h3>
                    <pre className="p-3 bg-muted/50 rounded-md text-center font-mono text-lg leading-tight border overflow-x-auto">{brandElements.asciiLogo}</pre>
                </div>
            )}
            {brandElements.colorPaletteSuggestion && <Separator />}
            {brandElements.colorPaletteSuggestion && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary"><Palette className="mr-2 h-5 w-5"/>Color Palette Idea</h3>
                <p className="text-muted-foreground p-3 bg-muted/50 rounded-md border">{brandElements.colorPaletteSuggestion}</p>
              </div>
            )}
            {brandElements.taglines && brandElements.taglines.length > 0 && <Separator />}
            {brandElements.taglines && brandElements.taglines.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary"><Quote className="mr-2 h-5 w-5"/>Taglines</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {brandElements.taglines.map((tagline, index) => (
                    <li key={index} className="text-muted-foreground italic">"{tagline}"</li>
                  ))}
                </ul>
              </div>
            )}
            {brandElements.visionStatement && <Separator />}
            {brandElements.visionStatement && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary"><Eye className="mr-2 h-5 w-5"/>Vision Statement</h3>
                <p className="text-muted-foreground">{brandElements.visionStatement}</p>
              </div>
            )}
            {brandElements.missionStatement && <Separator />}
            {brandElements.missionStatement && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary"><Target className="mr-2 h-5 w-5"/>Mission Statement</h3>
                <p className="text-muted-foreground">{brandElements.missionStatement}</p>
              </div>
            )}
            {brandElements.brandDescription && <Separator />}
            {brandElements.brandDescription && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary"><VenetianMask className="mr-2 h-5 w-5"/>Brand Description</h3>
                <p className="text-muted-foreground">{brandElements.brandDescription}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <p className="text-xs text-muted-foreground">These are AI-generated suggestions. Feel free to adapt them to your needs!</p>
            <Button onClick={handleProceed} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              Accept &amp; Proceed to Product Profile <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
