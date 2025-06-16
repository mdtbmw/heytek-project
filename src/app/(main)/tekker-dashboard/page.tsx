
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Briefcase, DollarSign, UserCheck, Search, CheckCircle, Bell, Settings, Edit3, Layers, Award, Star, Brain, MessageSquarePlus, TrendingUp, Users as TeamIcon, Target as TargetIcon, Zap, Lightbulb, ThumbsUp, BarChartHorizontalBig, ExternalLink, PlusCircle, Wrench, Hammer, Circle, Construction, ListChecks, Palette, Rocket as RocketIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";

interface HeyTekBuild {
  id: string;
  title: string;
  founderCompany: string;
  logoUrl: string;
  dataAiHint?: string;
  implementationSpecializations: string[];
  implementationFee: number;
  targetTimeline: string;
  postedDate: string;
  status: 'Available' | 'Briefing' | 'Foundation Setup' | 'Core Feature Implementation' | 'Branding & UI Application' | 'Content & Data Population' | 'Testing & QA' | 'Deployment & Handover' | 'Successfully Implemented';
  progress: number;
  description: string;
  buildDetailsUrl?: string;
  phaseTasks: { name: string, done: boolean, phase: HeyTekBuild['status'], value: number, status: 'To Do' | 'Completed by Tekker' | 'Pending HeyTek Approval' | 'Approved & Paid' | 'Overdue' }[];
  applied: boolean;
  paymentPreference?: 'daily' | 'weekly' | 'monthly';
  accumulatedForBuild: number;
}

interface ActiveImplementation extends HeyTekBuild {
  dueDate: string;
  currentPhaseDetails: string;
}

interface BadgeInfo {
  id:string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  achieved: boolean;
}

const initialBuildsData: HeyTekBuild[] = [
  { id: 'b1', title: "Implement 'Zenith' AI Wellness Coach", founderCompany: 'AuraHealth Inc.', logoUrl: 'https://placehold.co/100x100.png', dataAiHint: 'wellness health logo', implementationSpecializations: ['HeyTek Platform Config', 'Genkit Flow Deployment', 'Next.js & ShadCN Implementation'], implementationFee: 4500, targetTimeline: '10 Weeks', postedDate: '3 days ago', applied: false, description: 'Full implementation of an AI wellness coaching platform based on HeyTek-generated specs. Includes user auth, Genkit AI flows for personalized advice, and a Next.js frontend.', status: 'Available', progress: 0, buildDetailsUrl: '#', phaseTasks: [], accumulatedForBuild: 0 },
  { id: 'b2', title: "Launch 'CreatorConnect' Platform", founderCompany: 'Synergy Hub Ltd.', logoUrl: 'https://placehold.co/100x100.png', dataAiHint: 'social network logo', implementationSpecializations: ['Firebase Integration', 'Third-party API Impl', 'QA & Testing'], implementationFee: 5200, targetTimeline: '12 Weeks', postedDate: '6 days ago', applied: true, description: 'Implement a networking platform for content creators. Focus on robust backend with Firebase and Stripe integration for premium features.', status: 'Briefing', progress: 10, buildDetailsUrl: '#',
    phaseTasks: [
        { name: 'Initial briefing with Synergy Hub', phase: 'Briefing', done: true, value: 100, status: 'Approved & Paid' },
        { name: 'Clarify technical specifications', phase: 'Briefing', done: true, value: 150, status: 'Approved & Paid' },
        { name: 'Finalize implementation roadmap', phase: 'Briefing', done: false, value: 200, status: 'To Do' }
    ],
    accumulatedForBuild: 250, paymentPreference: 'weekly'
  },
  { id: 'b3', title: "Build Out 'EduSpark' Learning Portal", founderCompany: 'LearnWell Solutions', logoUrl: 'https://placehold.co/100x100.png', dataAiHint: 'education e-learning logo', implementationSpecializations: ['Next.js & ShadCN Implementation', 'Content & Data Migration', 'Technical Documentation'], implementationFee: 3800, targetTimeline: '7 Weeks', postedDate: '10 days ago', applied: true, description: 'Implement the frontend and content structure for an online learning portal. HeyTek has provided detailed UI mockups and content schemas.', status: 'Core Feature Implementation', progress: 55, buildDetailsUrl: '#',
    phaseTasks: [
        { name: 'Platform foundation & auth setup', phase: 'Foundation Setup', done: true, value: 500, status: 'Approved & Paid' },
        { name: 'Course module display components', phase: 'Core Feature Implementation', done: true, value: 600, status: 'Pending HeyTek Approval'},
        { name: 'User progress tracking logic', phase: 'Core Feature Implementation', done: false, value: 400, status: 'To Do'}
    ],
    accumulatedForBuild: 500, paymentPreference: 'monthly'
  },
];

const initialBadgesData: BadgeInfo[] = [
  { id: 'badge_first_impl', name: 'Implementation Pioneer', description: 'Successfully implemented your first HeyTek Build!', icon: Star, color: 'text-primary', achieved: false },
  { id: 'badge_three_impl', name: 'Build Master', description: 'Successfully implemented 3 HeyTek Builds.', icon: Award, color: 'text-accent', achieved: false },
  { id: 'badge_five_streak', name: 'Implementation Streak Ace (x5)', description: 'Implemented 5 Builds in a row successfully!', icon: Zap, color: 'text-primary', achieved: false },
  { id: 'badge_rapid_impl', name: 'Rapid Implementer', description: 'Implemented a Build significantly ahead of schedule.', icon: Lightbulb, color: 'text-primary', achieved: false },
  { id: 'badge_flawless_launch', name: 'Flawless Launch', description: 'Received exceptional feedback on a Build implementation.', icon: ThumbsUp, color: 'text-green-500 dark:text-green-400', achieved: false },
];

const buildPayoutsChartData = [
  { quarter: "Q1'24", payouts: 0 },
  { quarter: "Q2'24", payouts: 4200 },
  { quarter: "Q3'24", payouts: 3500 },
  { quarter: "Q4'24", payouts: 0 },
];

const chartConfig = {
  payouts: { label: "Payouts ($)", color: "hsl(var(--chart-1))" }, // Updated to use theme variable for chart
} satisfies ChartConfig;


export default function TekkerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [builds, setBuilds] = useState<HeyTekBuild[]>(initialBuildsData);
  const [badges, setBadges] = useState<BadgeInfo[]>(initialBadgesData);
  const [activeImplementations, setActiveImplementations] = useState<ActiveImplementation[]>([]);
  const [completedBuildsCount, setCompletedBuildsCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lifetimePayouts, setLifetimePayouts] = useState(7700);
  const [tekkerLevel, setTekkerLevel] = useState("Tekker Initiate");
  const [tekkerPaymentPreference, setTekkerPaymentPreference] = useState<'daily' | 'weekly' | 'monthly'>('weekly');


  const userName = user?.email?.split('@')[0] || 'Tekker';

  useEffect(() => {
    const firstActiveBuildWithPref = builds.find(b => b.applied && b.paymentPreference);
    if (firstActiveBuildWithPref) {
        setTekkerPaymentPreference(firstActiveBuildWithPref.paymentPreference!);
    }

    const currentImplementations = builds
      .filter(b => b.applied && b.status !== 'Successfully Implemented' && b.status !== 'Available')
      .map(b => {
        const nextTask = b.phaseTasks.find(t => t.status === 'To Do' || t.status === 'Completed by Tekker');
        return {
          ...b,
          dueDate: `Target: ${b.targetTimeline}`,
          currentPhaseDetails: nextTask ? `Next: ${nextTask.name}` : `${b.status} phase ongoing`,
        };
      });
    setActiveImplementations(currentImplementations);
  }, [builds]);


  const handleApplyForBuild = (buildId: string) => {
    setBuilds(prevBuilds =>
      prevBuilds.map(b =>
        b.id === buildId ? {
            ...b,
            applied: true,
            status: 'Briefing',
            progress: 5,
            phaseTasks: [
                {name: 'Initial Contact with Founder', phase: 'Briefing', done: false, value: 50, status: 'To Do'},
                {name: 'Review HeyTek Build Specifications', phase: 'Briefing', done: false, value: 100, status: 'To Do'},
                {name: 'Finalize Implementation Plan & Timeline', phase: 'Briefing', done: false, value: 150, status: 'To Do'}
            ]
        } : b
      )
    );
    const build = builds.find(b => b.id === buildId);
    toast({
      title: 'Application Submitted!',
      description: `You've applied to implement "${build?.title}". Awaiting founder confirmation. (Mock)`,
      icon: <CheckCircle className="h-5 w-5 text-primary" />
    });
  };

  const handleMarkTaskComplete = (buildId: string, taskName: string) => {
     setBuilds(prevBuilds => prevBuilds.map(b => {
        if (b.id === buildId) {
            const updatedTasks = b.phaseTasks.map(task =>
                task.name === taskName ? {...task, status: 'Completed by Tekker' as const} : task
            );
            setTimeout(() => {
                 setBuilds(currentBuilds => currentBuilds.map(cb => {
                    if (cb.id === buildId) {
                        let newAccumulated = cb.accumulatedForBuild;
                        const finalTasks = cb.phaseTasks.map(ftask => {
                             if (ftask.name === taskName && ftask.status === 'Completed by Tekker') {
                                newAccumulated += ftask.value;
                                return {...ftask, status: 'Approved & Paid' as const, done: true};
                            }
                            return ftask;
                        });
                        return {...cb, phaseTasks: finalTasks, accumulatedForBuild: newAccumulated};
                    }
                    return cb;
                 }));
                 toast({title: "Task Approved!", description: `"${taskName}" is approved & payment added to accumulation.`, icon: <ThumbsUp />});
            }, 1500);

            return {...b, phaseTasks: updatedTasks};
        }
        return b;
     }));
     toast({title: "Task Marked Complete!", description: `"${taskName}" submitted for HeyTek approval.`});
  };


  const handleMarkAsImplemented = (buildId: string) => {
    const buildToEnd = activeImplementations.find(b => b.id === buildId);
    if (!buildToEnd) return;

    const newCompletedCount = completedBuildsCount + 1;
    const newStreak = currentStreak + 1;
    const newPayouts = lifetimePayouts + buildToEnd.implementationFee;


    setCompletedBuildsCount(newCompletedCount);
    setCurrentStreak(newStreak);
    setLifetimePayouts(newPayouts);

    setBuilds(prev => prev.map(b => b.id === buildId ? {...b, status: 'Successfully Implemented', progress: 100, accumulatedForBuild: b.implementationFee } : b));

    let newBadges = [...badges];
    if (newCompletedCount === 1 && !badges.find(b=>b.id==='badge_first_impl')?.achieved) {
      newBadges = newBadges.map(b => b.id === 'badge_first_impl' ? {...b, achieved: true} : b);
      toast({ title: "Badge Unlocked!", description: "You earned 'Implementation Pioneer'!", icon: <Star className="h-5 w-5 text-primary"/> });
      setTekkerLevel("Junior Implementer");
    }
    if (newCompletedCount === 3 && !badges.find(b=>b.id==='badge_three_impl')?.achieved) {
      newBadges = newBadges.map(b => b.id === 'badge_three_impl' ? {...b, achieved: true} : b);
      toast({ title: "Badge Unlocked!", description: "You earned 'Build Master'!", icon: <Award className="h-5 w-5 text-accent"/> });
      setTekkerLevel("Senior Implementer");
    }
    if (newStreak === 5 && !badges.find(b=>b.id==='badge_five_streak')?.achieved) {
      newBadges = newBadges.map(b => b.id === 'badge_five_streak' ? {...b, achieved: true} : b);
      toast({ title: "Badge Unlocked!", description: "Incredible! 'Implementation Streak Ace (x5)' achieved!", icon: <Zap className="h-5 w-5 text-primary"/> });
      setTekkerLevel("Elite Tek-Lead");
    }

    setBadges(newBadges);

    toast({
      title: 'Build Successfully Implemented!',
      description: `"${buildToEnd.title}" is complete. Payout: $${buildToEnd.implementationFee.toLocaleString()}. Great work!`,
      icon: <ThumbsUp />
    });
  };

  const getNextStreakReward = () => {
    if (currentStreak < 2) return "Complete 2 more Builds for 'Build Master' Badge!";
    if (currentStreak < 5) return `Complete ${5-currentStreak} more for 'Streak Ace (x5)' & Elite Rank!`;
    return "Maintain your amazing implementation streak!";
  }

  const availableBuildsCount = builds.filter(b => !b.applied && b.status === 'Available').length;
  const totalAccumulatedAwaitingDisbursement = builds.reduce((sum, build) => {
    if (build.applied && build.status !== 'Successfully Implemented') {
        return sum + build.phaseTasks.filter(t => t.status === 'Approved & Paid').reduce((taskSum, task) => taskSum + task.value, 0);
    }
    return sum;
  }, 0);

  const getNextPayoutDate = () => {
    const today = new Date();
    if (tekkerPaymentPreference === 'daily') return 'Tomorrow';
    if (tekkerPaymentPreference === 'weekly') {
        const nextFriday = new Date(today);
        nextFriday.setDate(today.getDate() + (5 + 7 - today.getDay()) % 7);
        return nextFriday.toLocaleDateString('en-US', { month: 'short', day: 'numeric'});
    }
    if (tekkerPaymentPreference === 'monthly') {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return `1st of ${nextMonth.toLocaleDateString('en-US', { month: 'long'})}`;
    }
    return 'N/A';
  };


  const implementationPhases: HeyTekBuild['status'][] = ['Briefing', 'Foundation Setup', 'Core Feature Implementation', 'Branding & UI Application', 'Content & Data Population', 'Testing & QA', 'Deployment & Handover', 'Successfully Implemented'];
  const getPhaseIcon = (phase: HeyTekBuild['status']) => {
    switch(phase) {
      case 'Briefing': return MessageSquarePlus;
      case 'Foundation Setup': return Layers;
      case 'Core Feature Implementation': return Wrench;
      case 'Branding & UI Application': return Palette;
      case 'Content & Data Population': return Briefcase;
      case 'Testing & QA': return CheckCircle;
      case 'Deployment & Handover': return RocketIcon;
      case 'Successfully Implemented': return Award;
      default: return Circle;
    }
  };


  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-card via-background to-secondary/20 dark:from-card dark:via-background dark:to-secondary/30 border-border shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline">
                Tekker Dashboard: <span className="text-primary">{userName}</span>
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground dark:text-foreground/80 mt-1">
                Your hub for HeyTek Builds, payouts, and leveling up your Implementer status!
              </CardDescription>
            </div>
            <div className="relative w-24 h-24 md:w-28 md:h-28 mt-[-10px] mr-[-10px] hidden sm:block">
                <Image src="https://placehold.co/300x300.png" alt="Tekker gear" fill data-ai-hint="abstract tech gear" className="object-contain opacity-80"/>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Builds</CardTitle>
            <Search className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{availableBuildsCount}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">Opportunities to implement.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Implementations</CardTitle>
            <Construction className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeImplementations.length}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">Builds in progress.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Payouts</CardTitle>
            <DollarSign className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${lifetimePayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">From completed Builds.</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Implementation Streak</CardTitle>
            <Zap className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{currentStreak} <span className="text-sm"> 연속</span></div>
            <p className="text-xs text-primary/80 dark:text-primary/70">{getNextStreakReward()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary"/>My Implementer Profile - <span className="text-accent">{tekkerLevel}</span></CardTitle>
          <CardDescription className="text-muted-foreground dark:text-foreground/70">Showcase your implementation prowess and track your HeyTek journey. Your preferred payout is: <Badge variant="outline" className="ml-1 border-primary text-primary">{tekkerPaymentPreference}</Badge></CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png?size=120&background=FFD700&color=000000`} alt={userName} />
            <AvatarFallback className="text-2xl bg-muted text-foreground">{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-foreground dark:text-foreground/90">{userName}</h3>
            <p className="text-md text-muted-foreground dark:text-foreground/70">HeyTek Certified Implementer (Mock Specializations)</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="secondary">HeyTek Config</Badge><Badge variant="secondary">Genkit Pro</Badge><Badge variant="secondary">Next.js Ninja</Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => toast({ title: "Coming Soon!", description: "Full profile editing will be available shortly."})}>
              <Edit3 /> View/Edit Profile
            </Button>
            <Button variant="default" className="bg-primary hover:bg-primary/80 text-primary-foreground" onClick={() => toast({ title: "Your Public Portfolio", description: "This would link to your HeyTek Implementer portfolio page. (Mock)"})}>
              <ExternalLink /> Public Portfolio (Mock)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-card/80 border-primary/20 dark:border-primary/30 shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Brain className="text-primary" /> AI Implementation Assistant
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-foreground/70">
                Leverage AI to generate a structured plan for your HeyTek Builds.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-4">
                Get insights on phases, key tasks, and potential challenges to streamline your implementation process.
                This tool helps you organize your approach and estimate efforts for new Builds.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
                <Link href="/implementation-planner">
                    <ListChecks /> Launch AI Planner
                </Link>
            </Button>
        </CardContent>
      </Card>


      <Card className="dark:bg-card/80">
        <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2"><Briefcase />Tekker Payment & Build Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground dark:text-foreground/80 space-y-2">
            <p><strong>Payment Model:</strong> Payment for tasks accumulates upon HeyTek approval. Accumulated funds are disbursed according to your <strong className="text-primary">{tekkerPaymentPreference}</strong> preference.</p>
            <p><strong>3-Month Target:</strong> Each Build is targeted for full implementation within approximately 3 months.</p>
            <p><strong>Task Defaults:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li>A <strong className="text-accent dark:text-orange-400">3-day default</strong> on a task may result in a warning or potential deduction from the task's value.</li>
                <li>A <strong className="text-destructive dark:text-red-400">6-day default</strong> may lead to Build cancellation and transfer. Payment will be for approved work minus any deductions.</li>
            </ul>
            <p>Always communicate proactively if you foresee delays!</p>
        </CardContent>
      </Card>


      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2"><Hammer className="text-primary h-6 w-6"/> My Active Implementations ({activeImplementations.length})</h2>
        {activeImplementations.length > 0 ? activeImplementations.map(build => (
          <Card key={build.id} className="mb-4 hover:shadow-xl transition-shadow duration-300 group dark:bg-card/80">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary">{build.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground dark:text-foreground/70">For: {build.founderCompany} | Target: {build.targetTimeline} | Fee: ${build.implementationFee.toLocaleString()}</CardDescription>
                </div>
                <Badge variant={build.progress === 100 ? "default" : "secondary"} className={`mt-2 sm:mt-0 text-xs ${build.progress === 100 && build.status === 'Successfully Implemented' ? 'bg-green-500 dark:bg-green-600 text-white dark:text-black' : 'bg-primary/20 text-primary'}`}>
                  {build.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground dark:text-foreground/60 mb-1">
                      <span>Overall Implementation Progress</span>
                      <span>{build.progress}%</span>
                  </div>
                  <Progress value={build.progress} className="h-3 [&>div]:bg-primary" />
              </div>
              <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-2">Current Focus: <span className="font-medium text-foreground dark:text-foreground/90">{build.currentPhaseDetails}</span></p>
              <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-3">Accumulated for this Build: <span className="font-semibold text-primary">${build.accumulatedForBuild.toLocaleString()}</span></p>

              <div className="mt-3 mb-2">
                <h4 className="text-xs font-semibold text-muted-foreground dark:text-foreground/60 mb-1">Implementation Phases:</h4>
                <div className="flex flex-wrap gap-1 text-xs">
                    {implementationPhases.map(phase => {
                        const PhaseIcon = getPhaseIcon(phase);
                        const isCurrent = build.status === phase;
                        const isCompleted = implementationPhases.indexOf(phase) < implementationPhases.indexOf(build.status) || build.status === 'Successfully Implemented';
                        return (
                            <div key={phase} className={`p-1.5 rounded-md flex items-center gap-1
                                ${isCompleted ? 'bg-primary/15 text-primary' : isCurrent ? 'bg-accent/20 dark:bg-accent/30 text-accent dark:text-foreground font-semibold ring-1 ring-accent' : 'bg-muted/50 text-muted-foreground opacity-70'}`}>
                                <PhaseIcon className={`h-3 w-3 ${isCompleted || isCurrent ? '' : 'opacity-50'}`} />
                                <span>{phase}</span>
                            </div>
                        );
                    })}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground dark:text-foreground/70">Daily Tasks for Current Phase ({build.status}):</h4>
                {build.phaseTasks.filter(task => task.phase === build.status).length > 0 ?
                    build.phaseTasks.filter(task => task.phase === build.status).map(task => (
                    <div key={task.name} className={`text-xs flex items-center justify-between p-2 rounded border ${task.status === 'Approved & Paid' ? 'bg-green-500/10 border-green-500/30' : task.status === 'Pending HeyTek Approval' ? 'bg-yellow-500/10 border-yellow-500/30' : task.status === 'Overdue' ? 'bg-red-500/10 border-red-500/30 dark:bg-red-700/20 dark:border-red-600/40' : 'bg-muted/30 border-border'}`}>
                        <div>
                            <span className={`${task.status === 'Approved & Paid' || task.status === 'Completed by Tekker' ? 'line-through text-muted-foreground dark:text-foreground/60' : 'text-foreground dark:text-foreground/80'}`}>{task.name} (Value: ${task.value})</span>
                            <Badge variant="outline" className={`ml-2 text-[10px] ${task.status === 'Approved & Paid' ? 'border-green-600 text-green-700 dark:text-green-400' : task.status === 'Pending HeyTek Approval' ? 'border-yellow-600 text-yellow-700 dark:text-yellow-400' : task.status === 'Overdue' ? 'border-red-600 text-red-700 dark:text-red-400' : 'border-muted-foreground'}`}>{task.status}</Badge>
                        </div>
                        {task.status === 'To Do' &&
                            <Button size="xs" variant="outline" className="text-xs h-6 px-2" onClick={() => handleMarkTaskComplete(build.id, task.name)}>Mark Complete</Button>}
                    </div>
                )) : <p className="text-xs text-muted-foreground dark:text-foreground/60">No specific tasks listed for this phase yet, or all tasks are approved.</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({title:"Build Details", description:`Detailed view for ${build.title} coming soon.`})}>View Build Details</Button>
              <Button size="sm" className="bg-green-600 dark:bg-green-700 hover:bg-green-700/90 dark:hover:bg-green-600 text-primary-foreground dark:text-black" onClick={() => handleMarkAsImplemented(build.id)} disabled={build.progress < 90 || build.status === 'Successfully Implemented'}>
                <CheckCircle /> Mark Implemented
              </Button>
            </CardFooter>
          </Card>
        )) : (
          <Card className="dark:bg-card/80"><CardContent className="pt-6 text-muted-foreground dark:text-foreground/70 text-center">You have no active implementations. Find a new Build in the Marketplace!</CardContent></Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2"><DollarSign />Payout Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-1">Lifetime Payouts (Completed Builds): <strong className="text-lg text-primary">${lifetimePayouts.toLocaleString()}</strong></p>
            <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-1">Total Accumulated (Awaiting Disbursement): <strong className="text-lg text-primary">${totalAccumulatedAwaitingDisbursement.toLocaleString()}</strong></p>
            <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-4">Next Scheduled Payout Date: <strong className="text-lg text-primary">{getNextPayoutDate()}</strong> (Based on <span className="capitalize">{tekkerPaymentPreference}</span> preference)</p>
            <div className="h-[200px]">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={buildPayoutsChartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="quarter" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar dataKey="payouts" fill="hsl(var(--chart-1))" radius={4}>
                         <LabelList dataKey="payouts" position="top" offset={5} className="fill-foreground dark:fill-foreground/90" fontSize={10} formatter={(value: number) => value > 0 ? `$${value.toLocaleString()}`: ''} />
                      </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => toast({title:"Coming Soon", description:"Full payout history page is on the way."})}>View Payout History (Mock)</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2"><Award />Achievements & Badges</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-foreground/70">Celebrate your implementation milestones!</CardDescription>
          </CardHeader>
          <CardContent>
            {badges.filter(b => b.achieved).length === 0 && <p className="text-sm text-muted-foreground dark:text-foreground/70 text-center py-4">No badges earned yet. Successfully implement Builds to unlock them!</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map(badge => badge.achieved && (
                <div key={badge.id} className="flex flex-col items-center text-center p-3 border rounded-lg bg-card dark:bg-background/50 hover:bg-muted/50 dark:hover:bg-secondary/30 transition-colors group">
                  <badge.icon className={`h-10 w-10 mb-2 ${badge.color} group-hover:scale-110 transition-transform`} />
                  <p className="text-xs font-semibold group-hover:text-primary">{badge.name}</p>
                </div>
              ))}
            </div>
            {badges.filter(b => !b.achieved).length > 0 && (
              <>
                <h4 className="text-sm font-semibold mt-6 mb-2 text-muted-foreground dark:text-foreground/60">Next Badges to Unlock:</h4>
                <div className="space-y-2">
                {badges.filter(b => !b.achieved).slice(0,2).map(badge =>(
                    <div key={badge.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30 dark:bg-secondary/20 opacity-70">
                         <badge.icon className={`h-6 w-6 ${badge.color}`} />
                         <div>
                            <p className="text-xs font-medium text-foreground dark:text-foreground/80">{badge.name}</p>
                            <p className="text-xs text-muted-foreground dark:text-foreground/60">{badge.description}</p>
                         </div>
                    </div>
                ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 via-card to-accent/10 dark:from-primary/20 dark:via-card/80 dark:to-accent/20 border-primary/30 dark:border-primary/40 hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2"><Layers />Implementer Level & Upgrades</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
          <div className="p-4 bg-card dark:bg-background/50 rounded-lg border shadow-inner">
            <h3 className="text-lg font-semibold mb-1 text-foreground dark:text-foreground/90">Current Level: <span className="text-primary">{tekkerLevel}</span></h3>
            <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-3">Keep implementing Builds to level up and unlock new capabilities & recognition!</p>
            {tekkerLevel !== "Elite Tek-Lead" && <Progress value={currentStreak * 20} className="h-2 [&>div]:bg-primary" />}
            {tekkerLevel === "Elite Tek-Lead" && <p className="text-sm font-semibold text-primary">Max Level Achieved! You're an Implementation Legend! ✨</p>}
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground/90">Available Upgrades:</h3>
            <Button variant="outline" className="w-full justify-start gap-2 hover:border-primary hover:text-primary" onClick={() => toast({title:"Team Lead Certification (Soon!)", description:"Ability to form and manage Tekker implementation teams will be available for Elite Tek-Leads."})} disabled={tekkerLevel !== "Elite Tek-Lead"}>
              <TeamIcon /> Form an Implementation Team <Badge variant="secondary" className="ml-auto">Elite Tek-Lead</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 hover:border-primary hover:text-primary" onClick={() => toast({title:"Request to Implement (Soon!)", description:"Unlock ability to proactively propose implementation services to listed businesses needing a Tekker."})} disabled={tekkerLevel === "Tekker Initiate"}>
              <MessageSquarePlus /> Request to Implement <Badge variant="secondary" className="ml-auto">Junior Implementer+</Badge>
            </Button>
             <Button variant="outline" className="w-full justify-start gap-2 hover:border-primary hover:text-primary" onClick={() => toast({title:"Portfolio Spotlight (Soon!)", description:"Get your profile featured when Founders search for Implementers."})} disabled={currentStreak < 5}>
              <Lightbulb /> Portfolio Spotlight <Badge variant="secondary" className="ml-auto">5-Streak Ace</Badge>
            </Button>
          </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground dark:text-foreground/70">Upgrades unlock as you gain experience and complete successful implementations.</p>
         </CardFooter>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2"><Search /> Build Marketplace</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {builds.filter(b => !b.applied && b.status === 'Available').map((build) => (
            <Card key={build.id} className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] flex flex-col group border-muted-foreground/20 dark:bg-card/80 dark:border-border">
              <CardHeader>
                <div className="flex items-start gap-4">
                    <Image src={build.logoUrl} alt={`${build.founderCompany} logo`} width={56} height={56} className="rounded-lg border-2 border-border group-hover:border-primary transition-colors" data-ai-hint={build.dataAiHint || 'company logo'} />
                    <div>
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{build.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground dark:text-foreground/70">{build.founderCompany} - Posted {build.postedDate}</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <p className="text-sm text-muted-foreground dark:text-foreground/70 h-12 overflow-hidden line-clamp-2">{build.description}</p>
                <div className="flex flex-wrap gap-2">
                  {build.implementationSpecializations.map(spec => <Badge key={spec} variant="secondary" className="group-hover:bg-primary/20 dark:group-hover:bg-primary/30 group-hover:text-primary transition-colors">{spec}</Badge>)}
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="font-medium text-foreground dark:text-foreground/80">Fee: <strong className="text-primary">${build.implementationFee.toLocaleString()}</strong></span>
                  <span className="font-medium text-foreground dark:text-foreground/80">Timeline: <strong>{build.targetTimeline}</strong></span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 hover:border-primary hover:text-primary">
                    <Link href={build.buildDetailsUrl || "#"} target="_blank" rel="noopener noreferrer">View Build Specs</Link>
                </Button>
                <Button
                    onClick={() => handleApplyForBuild(build.id)}
                    disabled={build.applied}
                    className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70"
                >
                  {build.applied ? <CheckCircle /> : ''} {build.applied ? 'Applied' : 'Apply for this Build'}
                </Button>
              </CardFooter>
            </Card>
          ))}
           {builds.filter(b => !b.applied && b.status === 'Available').length === 0 && <Card className="lg:col-span-2 dark:bg-card/80"><CardContent className="pt-6 text-muted-foreground dark:text-foreground/70 text-center">No new Builds available that match your profile right now. Great job clearing the board, or check back soon!</CardContent></Card>}
            <Card className="border-dashed border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group dark:bg-card/50 dark:hover:bg-secondary/30 dark:border-border">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-6">
                    <PlusCircle className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground/70 group-hover:text-primary transition-colors">Looking for More Builds?</h3>
                    <p className="text-sm text-muted-foreground dark:text-foreground/60 mt-1">Adjust your specialization filters or check back often for new HeyTek implementation opportunities.</p>
                    <Button variant="ghost" className="mt-4 text-primary group-hover:bg-primary/10" onClick={() => toast({ title: "Filter Builds (Mock)", description: "Advanced Build filtering coming soon!"})}>
                        Filter Builds (Mock)
                    </Button>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

