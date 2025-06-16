
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOnboarding, accountSchema, type AccountData } from '@/contexts/AgentOnboardingContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const { onboardingData, updateOnboardingData, setCurrentStep } = useAgentOnboarding();
  const router = useRouter();
  const { signup, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<AccountData>({
    resolver: zodResolver(accountSchema),
    defaultValues: onboardingData.account || {
      username: '',
      password: '',
      verifyPassword: '',
      enable2FA: false,
      agreeToTerms: false,
      agreeToPrivacy: false,
      agreeToCodeOfHonor: onboardingData.vision?.path === 'tekker' ? false : undefined,
    },
    context: { vision: onboardingData.vision } // Pass context for Zod refine
  });
  
  const isTekker = onboardingData.vision?.path === 'tekker';

  const onSubmit = async (data: AccountData) => {
    updateOnboardingData({ account: data });
    
    if (!onboardingData.profile?.email || !onboardingData.profile?.country) {
      toast({
        title: "Missing Information",
        description: "Profile information (email and country) is missing. Please go back and complete it.",
        variant: "destructive",
      });
      
      const founderPath = onboardingData.vision?.path === 'founder_ceo';
      setCurrentStep(founderPath ? 5 : 6); 
      router.push('/agent-onboarding/legal'); 
      return;
    }

    const userRole = onboardingData.vision?.path || 'founder_ceo'; 

    try {
      await signup(onboardingData.profile.email, onboardingData.profile.country, userRole);
      toast({
        title: "Account Creation Initiated!",
        description: "You're one step away from the Tekverse!",
      });
      setCurrentStep(8); 
      router.push('/agent-onboarding/complete');
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "Something went wrong during account creation. Please try again.",
        variant: "destructive",
      });
      console.error('Signup failed', error);
    }
  };

  const handleBack = () => {
    const founderPath = onboardingData.vision?.path === 'founder_ceo';
    setCurrentStep(founderPath ? 5 : 6);
    router.push('/agent-onboarding/legal');
  }

  return (
    <Card className="w-full shadow-xl animate-slide-in bg-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-headline flex items-center gap-2 text-primary dark:text-primary">
          <UserPlus className="h-8 w-8" /> You&apos;re Almost There!
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground dark:text-muted-foreground">
          Create your login credentials to access the Tekverse. This is the final data collection step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your_unique_username" {...field} className="dark:bg-input dark:text-foreground"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Choose a strong password" {...field} className="dark:bg-input dark:text-foreground"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verifyPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verify Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} className="dark:bg-input dark:text-foreground"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable2FA"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 dark:hover:bg-muted/20">
                   <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal flex items-center gap-2 cursor-pointer"><Lock className="h-4 w-4"/>Enable Two-Factor Authentication (Optional)</FormLabel>
                    <FormDescription className="text-xs">
                      Secure your account further with 2FA via mobile or email (mock).
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-3 pt-2">
                <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                        I agree to the <Link href="/terms" target="_blank" className="underline text-primary hover:text-primary/80">Terms of Use</Link>.
                        </FormLabel>
                        <FormMessage/>
                    </div>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="agreeToPrivacy"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                         I agree to the <Link href="/privacy" target="_blank" className="underline text-primary hover:text-primary/80">Data Privacy Policy</Link>.
                        </FormLabel>
                         <FormMessage/>
                    </div>
                    </FormItem>
                )}
                />
                {isTekker && (
                     <FormField
                        control={form.control}
                        name="agreeToCodeOfHonor"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox 
                                    checked={!!field.value} // Ensure it's boolean
                                    onCheckedChange={field.onChange} 
                                    id="codeOfHonor"
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="codeOfHonor" className="text-sm font-normal">
                                I agree to the <Link href="/tekker-code-of-honor" target="_blank" className="underline text-primary hover:text-primary/80">Tekker Code of Honor</Link>.
                                </FormLabel>
                                 <FormMessage/>
                            </div>
                            </FormItem>
                        )}
                    />
                )}
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={handleBack} className="border-muted-foreground text-muted-foreground hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/20">
                Back
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground" disabled={authLoading}>
                {authLoading ? 'Creating Account...' : 'Create Account & Enter Tekverse'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    