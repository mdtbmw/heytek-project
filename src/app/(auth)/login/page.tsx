
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { AppLogo } from '@/components/layout/AppLogo';
import { LogIn, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginFormSchema = z.object({
  emailOrUsername: z.string().min(1, { message: 'Please enter your email or username.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data.emailOrUsername, data.password);
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your dashboard...",
      });
    } catch (error) {
      let errorMessage = "Invalid credentials or user not found. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message.includes("User not found") ? "User not found or credentials incorrect (mock)." : error.message.includes("Password incorrect") ? "Password incorrect. Please try again." : "Login failed. Please try again.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Login failed', error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-4">
      <div className="mb-8">
        <AppLogo />
      </div>
      <Card className="w-full max-w-md shadow-2xl border-primary/30">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <LogIn className="text-accent h-7 w-7"/>
            Welcome Back!
            </CardTitle>
          <CardDescription>
            Log in to continue to HeyTek. Our platform serves Founders, Tekkers, Consultants, and Investors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your_email@example.com or username" {...field} />
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
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={authLoading}>
                {authLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to HeyTek?{' '}
            <Link href="/agent-onboarding/welcome" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} HeyTek. All rights reserved.
      </footer>
    </div>
  );
}
