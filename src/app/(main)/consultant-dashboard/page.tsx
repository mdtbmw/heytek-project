
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Users, Smile, Video, Edit, FileText, Brain, MessageSquareHeart, Clock, Briefcase, UserPlus, TrendingUp, ArrowRight, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ConsultantAppointment {
  id: string;
  clientName: string;
  companyName?: string;
  date: string;
  time: string;
  type: 'Intro Call' | 'Strategy Session' | 'Follow-up' | 'Workshop';
  platform: 'Zoom' | 'Google Meet' | 'Phone';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

interface ConsultantClient {
  id: string;
  name: string;
  companyName: string;
  avatarUrl: string;
  status: 'Active' | 'Prospect' | 'Past';
  lastInteraction: string;
  nextMilestone: string;
  industry: string;
  clientUrl?: string;
  aiHint: string;
}

const mockAppointmentsData: ConsultantAppointment[] = [
  { id: 'a1', clientName: 'Alice Wonderland', companyName: 'Wonderland Inc.', date: 'Tomorrow', time: '10:00 AM', type: 'Strategy Session', platform: 'Zoom', status: 'Upcoming' },
  { id: 'a2', clientName: 'Bob The Builder', companyName: 'BuildIt Co.', date: 'In 3 days', time: '02:30 PM', type: 'Intro Call', platform: 'Google Meet', status: 'Upcoming' },
  { id: 'a3', clientName: 'Charlie Chocolate', companyName: 'Sweet Factory', date: 'Next Monday', time: '11:00 AM', type: 'Workshop', platform: 'Zoom', status: 'Upcoming' },
  { id: 'a4', clientName: 'Diana Prince', companyName: 'Amazon Enterprises', date: 'Last Tuesday', time: '03:00 PM', type: 'Follow-up', platform: 'Phone', status: 'Completed' },
];

const mockClientsData: ConsultantClient[] = [
  { id: 'c1', name: 'Innovate Corp', companyName: 'Innovate Corp', avatarUrl: 'https://placehold.co/100x100.png', aiHint: 'tech company logo', status: 'Active', lastInteraction: '2 days ago', nextMilestone: 'Q2 Strategy Review', industry: 'Tech SaaS', clientUrl: '#' },
  { id: 'c2', name: 'GreenLeaf Organics', companyName: 'GreenLeaf Organics', avatarUrl: 'https://placehold.co/100x100.png', aiHint: 'nature company logo', status: 'Prospect', lastInteraction: '1 week ago', nextMilestone: 'Proposal Submission', industry: 'Retail', clientUrl: '#' },
  { id: 'c3', name: 'Legacy Builders', companyName: 'Legacy Builders', avatarUrl: 'https://placehold.co/100x100.png', aiHint: 'construction company logo', status: 'Past', lastInteraction: '3 months ago', nextMilestone: 'Project Completed', industry: 'Construction', clientUrl: '#' },
];

export default function ConsultantDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<ConsultantAppointment[]>(mockAppointmentsData);
  const [clients, setClients] = useState<ConsultantClient[]>(mockClientsData);
  const [userName, setUserName] = useState('Consultant');

  useEffect(() => {
    if (user?.email) {
      setUserName(user.email.split('@')[0] || 'Consultant');
    }
  }, [user]);

  const handleAction = (actionName: string, itemName: string) => {
    toast({
      title: `${actionName} (Mock Action)`,
      description: `"${actionName}" for ${itemName} would be processed here. This is a mock.`,
    });
  };

  const upcomingAppointmentsCount = appointments.filter(a => a.status === 'Upcoming').length;
  const activeClientsCount = clients.filter(c => c.status === 'Active').length;
  const mockClientSatisfaction = 92;

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-card via-background to-secondary/20 dark:from-card dark:via-background dark:to-secondary/30 border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline">
            Consultant Dashboard: <span className="text-primary">{userName}</span>
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground dark:text-foreground/80">
            Manage your client engagements, appointments, and access valuable resources.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground dark:text-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{upcomingAppointmentsCount}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">
              Scheduled meetings for this week.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Active Clients</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground dark:text-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">
              Currently engaged partnerships.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Client Satisfaction</CardTitle>
            <Smile className="h-5 w-5 text-muted-foreground dark:text-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{mockClientSatisfaction}%</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">
              Average based on mock feedback.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" /> AI Brand Voice Tool
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-foreground/70">
            Generate compelling brand voice archetypes for your clients using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-3">
            Help your clients discover their unique brand personality and communication style.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
            <Link href="/brand-voice-tool">
              Launch Brand Voice Generator <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>


      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2"><Clock className="text-primary h-6 w-6"/> Upcoming Appointments</h2>
        {appointments.filter(a => a.status === 'Upcoming').length > 0 ? appointments.filter(a => a.status === 'Upcoming').map(appt => (
          <Card key={appt.id} className="mb-4 hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.01] group border-muted-foreground/20 dark:bg-card/80 dark:border-border">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary transition-colors">
                  <AvatarFallback className="text-xl bg-muted dark:bg-secondary group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors text-foreground">{appt.clientName.substring(0,1).toUpperCase()}{appt.clientName.split(' ')[1]?.substring(0,1).toUpperCase() || ''}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg text-foreground dark:text-foreground/90 group-hover:text-primary transition-colors">{appt.type} with {appt.clientName}</p>
                  <p className="text-sm text-muted-foreground dark:text-foreground/70">{appt.companyName || 'Individual'}</p>
                  <p className="text-sm text-muted-foreground dark:text-foreground/70">{appt.date} at {appt.time} via <Badge variant="secondary" className="ml-1">{appt.platform}</Badge></p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 sm:mt-0 self-start sm:self-center">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/80 text-primary-foreground group-hover:bg-accent dark:group-hover:bg-accent group-hover:text-accent-foreground" onClick={() => handleAction('Join Meeting', appt.clientName)}>
                  <Video className="mr-1.5 h-4 w-4" /> Join
                </Button>
                <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary" onClick={() => handleAction('Reschedule', appt.clientName)}>
                  <Edit className="mr-1.5 h-4 w-4" /> Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : <Card className="dark:bg-card/80"><CardContent className="pt-6 text-muted-foreground dark:text-foreground/70 text-center">No upcoming appointments. Time to network!</CardContent></Card>}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2"><Briefcase className="text-primary h-6 w-6"/>Client Management</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {clients.map(client => (
            <Card key={client.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] group border-muted-foreground/20 dark:bg-card/80 dark:border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <Image src={client.avatarUrl} alt={`${client.name} logo`} width={48} height={48} className="rounded-lg border-2 border-border group-hover:border-primary transition-colors" data-ai-hint={client.aiHint} />
                    <div>
                        <CardTitle className="text-lg font-semibold text-foreground dark:text-foreground/90 group-hover:text-primary transition-colors">{client.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground dark:text-foreground/70">{client.industry}</CardDescription>
                    </div>
                     <Badge
                        variant={client.status === 'Active' ? 'default' : client.status === 'Prospect' ? 'secondary' : 'outline'}
                        className={`ml-auto text-xs ${client.status === 'Active' ? 'bg-primary text-primary-foreground' : client.status === 'Prospect' ? 'bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground' : 'border-muted text-muted-foreground dark:border-border dark:text-foreground/70'} group-hover:opacity-80 transition-opacity`}
                    >
                        {client.status}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm flex-grow">
                <p><strong className="text-muted-foreground dark:text-foreground/70">Last Interaction:</strong> <span className="text-foreground dark:text-foreground/80">{client.lastInteraction}</span></p>
                <p><strong className="text-muted-foreground dark:text-foreground/70">Next Milestone:</strong> <span className="text-foreground dark:text-foreground/80">{client.nextMilestone}</span></p>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild className="hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary">
                    <Link href={client.clientUrl || "#"} target="_blank" rel="noopener noreferrer">View Client</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/80 text-primary-foreground group-hover:bg-accent dark:group-hover:bg-accent group-hover:text-accent-foreground" onClick={() => handleAction('Schedule Follow-up', client.name)}>Follow-up</Button>
              </CardFooter>
            </Card>
          ))}
           {clients.length === 0 && <Card className="lg:col-span-3 dark:bg-card/80"><CardContent className="pt-6 text-muted-foreground dark:text-foreground/70 text-center">No clients to display. Add your first client!</CardContent></Card>}
           <Card className="border-dashed border-2 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group dark:bg-card/50 dark:hover:bg-secondary/30 dark:border-border">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-6">
                    <UserPlus className="h-12 w-12 text-muted-foreground dark:text-foreground/60 group-hover:text-primary transition-colors mb-3"/>
                    <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground/70 group-hover:text-primary transition-colors">Add New Client</h3>
                    <p className="text-sm text-muted-foreground dark:text-foreground/60 mt-1">Expand your consultancy network.</p>
                    <Button variant="ghost" className="mt-4 text-primary group-hover:bg-primary/10 dark:group-hover:bg-primary/20" onClick={() => handleAction('Add New Client', 'System')}>
                        Add Client (Mock)
                    </Button>
                </CardContent>
           </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-secondary/30 dark:bg-secondary/20 border-border dark:border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground dark:text-foreground/90"><Brain className="text-primary"/>Resource Hub</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-foreground/70">Access your templates, playbooks, and knowledge base.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button variant="outline" className="justify-start text-left hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary" onClick={() => handleAction('Access Templates', 'Resource Hub')}><FileText className="mr-2"/>Consulting Templates (Mock)</Button>
                <Button variant="outline" className="justify-start text-left hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary" onClick={() => handleAction('Access Playbooks', 'Resource Hub')}><TrendingUp className="mr-2"/>Strategy Playbooks (Mock)</Button>
                <Button variant="outline" className="justify-start text-left hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary" onClick={() => handleAction('Access Knowledge Base', 'Resource Hub')}><Brain className="mr-2"/>Personal Knowledge Base (Mock)</Button>
            </CardContent>
        </Card>
        <Card className="bg-card dark:bg-card/80 border-border hover:shadow-md transition-shadow">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-lg text-primary"><MessageSquareHeart className="h-5 w-5"/>Consultant's Corner</CardTitle>
                 <CardDescription className="text-muted-foreground dark:text-foreground/70">Quick insights for effective consulting.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground dark:text-foreground/80">"Clearly define the scope of work and deliverables upfront to manage expectations and ensure client satisfaction. Regular, proactive communication is key to building strong, lasting client relationships!"</p>
                 <Button variant="link" className="px-0 text-primary hover:text-primary/80 mt-2" onClick={() => handleAction('Learn More Tips', 'Consultant Corner')}>More Consulting Tips (Mock) <ArrowRight className="ml-1 h-4 w-4"/></Button>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
    