
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CountrySelect } from '@/components/common/CountrySelect';
import { useAgentOnboarding, profileSchema, type ProfileData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserCircle, CalendarDays, Camera, Sparkles, Info } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker'; 

export default function ProfilePage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: onboardingData.profile || {
      fullName: '',
      email: '',
      phoneNumber: '',
      country: '',
      dateOfBirth: undefined,
      passportPhoto: null,
      superpower: '',
    },
  });

  const onSubmit = (data: ProfileData) => {
    updateOnboardingData({ profile: data });
    setCurrentStep(3);
    router.push('/agent-onboarding/vision');
  };

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card border-border">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <UserCircle className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold font-headline text-primary dark:text-primary">
              Let&apos;s Get to Know You
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground mt-1">
              Your details help Sparky, our AI co-pilot, personalize your experience.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ada Lovelace" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 234 567 8900" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Country of Residence</FormLabel>
                    <CountrySelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1 font-semibold">Date of Birth (Optional)</FormLabel>
                     <Controller
                        name="dateOfBirth"
                        control={form.control}
                        render={({ field: controllerField }) => (
                           <DatePicker
                            date={controllerField.value ? new Date(controllerField.value) : undefined}
                            setDate={(date) => controllerField.onChange(date?.toISOString().split('T')[0])} 
                            buttonClassName="w-full justify-start text-left font-normal dark:bg-input dark:text-foreground text-base"
                            icon={<CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />}
                            placeholderText='Select your birth date'
                          />
                        )}
                      />
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="passportPhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold"><Camera className="h-5 w-5 text-muted-foreground" />Profile Photo (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} 
                      className="dark:bg-input dark:text-foreground file:text-primary dark:file:text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-primary/20 hover:file:bg-primary/20 dark:hover:file:bg-primary/30 cursor-pointer text-base"
                    />
                  </FormControl>
                   <FormDescription className="text-xs flex items-center gap-1"><Info size={12}/> A clear photo helps build trust in the Tekverse.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="superpower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 text-primary" />What&apos;s your superpower? (Fun!)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Turning coffee into groundbreaking code" {...field} className="dark:bg-input dark:text-foreground text-base"/>
                  </FormControl>
                  <FormDescription className="text-xs">Share something unique that drives you!</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-primary-foreground dark:text-primary-foreground text-lg py-6 rounded-md shadow-md hover:shadow-lg transition-shadow">
              Next: Define Your Vision <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
