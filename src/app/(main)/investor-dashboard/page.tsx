
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Briefcase, Zap, Eye, Link as LinkIcon, Users, FilePieChart, ShieldAlert, PlusCircle, Filter, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InvestmentOpportunity {
  id: string;
  name: string;
  logoUrl: string;
  industry: string;
  stage: 'Seed' | 'Series A' | 'Pre-seed' | 'Growth';
  fundingAsk: string;
  summary: string;
  watchlisted: boolean;
  traction?: string;
  pitchDeckUrl?: string;
  aiHint: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  logoUrl: string;
  status: 'Performing Well' | 'Needs Review' | 'Exited' | 'Underperforming';
  currentValue: string;
  lastUpdate: string;
  initialInvestment: string;
  companyUrl?: string;
  aiHint: string;
}

const mockOpportunitiesData: InvestmentOpportunity[] = [
  { id: 'opp1', name: 'EcoGrow Solutions', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'nature tech logo', industry: 'AgriTech', stage: 'Seed', fundingAsk: '$500K', summary: 'AI-powered crop monitoring to increase yield and sustainability.', watchlisted: false, traction: '10 pilot farms, 2 LOIs', pitchDeckUrl: '#' },
  { id: 'opp2', name: 'ConnectVerse', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'metaverse logo', industry: 'Social Metaverse', stage: 'Pre-seed', fundingAsk: '$250K', summary: 'Decentralized social platform for creators and communities.', watchlisted: true, traction: 'Alpha version with 1k+ signups', pitchDeckUrl: '#' },
  { id: 'opp3', name: 'HealthTrack AI', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'health tech logo', industry: 'HealthTech', stage: 'Series A', fundingAsk: '$2M', summary: 'Predictive analytics for personalized patient care.', watchlisted: false, traction: '5 hospital partnerships, $150k ARR', pitchDeckUrl: '#' },
  { id: 'opp4', name: 'QuantumLeap AI', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'quantum ai logo', industry: 'Deep Tech', stage: 'Seed', fundingAsk: '$750K', summary: 'Developing next-gen AI algorithms for complex problem-solving.', watchlisted: true, traction: 'Patents pending, research team assembled.', pitchDeckUrl: '#' },
];

const mockPortfolioData: PortfolioCompany[] = [
  { id: 'port1', name: 'FinTech Innovators', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'fintech company logo', status: 'Performing Well', currentValue: '$1.2M', lastUpdate: '1 month ago', initialInvestment: '$300K', companyUrl: '#' },
  { id: 'port2', name: 'EduSphere Online', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'education company logo', status: 'Needs Review', currentValue: '$450K', lastUpdate: '2 weeks ago', initialInvestment: '$500K', companyUrl: '#' },
  { id: 'port3', name: 'CleanEnergy Co.', logoUrl: 'https://placehold.co/100x100.png', aiHint: 'energy company logo', status: 'Exited', currentValue: '$3.5M (Realized)', lastUpdate: '6 months ago', initialInvestment: '$200K', companyUrl: '#' },
];

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>(mockOpportunitiesData);
  const [portfolio, setPortfolio] = useState<PortfolioCompany[]>(mockPortfolioData);
  const [userName, setUserName] = useState('Investor');

  useEffect(() => {
    if (user?.email) {
      setUserName(user.email.split('@')[0] || 'Investor');
    }
  }, [user]);


  const handleToggleWatchlist = (opportunityId: string) => {
    setOpportunities(prevOpps =>
      prevOpps.map(opp =>
        opp.id === opportunityId ? { ...opp, watchlisted: !opp.watchlisted } : opp
      )
    );
    const opp = opportunities.find(o => o.id === opportunityId);
    toast({
      title: opp?.watchlisted ? `"${opp?.name}" Removed from Watchlist` : `"${opp?.name}" Added to Watchlist!`,
      description: `Your watchlist has been updated. (Mock action)`,
      icon: <Eye className={`h-5 w-5 ${opp?.watchlisted ? 'text-muted-foreground dark:text-foreground/70' : 'text-primary'}`} />
    });
  };

  const handleAction = (actionName: string, itemName: string) => {
    toast({
      title: `${actionName} (Mock Action)`,
      description: `"${actionName}" for ${itemName} would be processed here. This is a mock.`,
    });
  };

  const totalInvestments = portfolio.filter(p => p.status !== 'Exited').reduce((sum, p) => sum + parseFloat(p.initialInvestment.replace('$', '').replace('M', '000000').replace('K', '000')), 0);
  const newOpportunitiesCount = opportunities.length;
  const mockPotentialROI = "18%";

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-card via-background to-secondary/20 dark:from-card dark:via-background dark:to-secondary/30 border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline">
            Investor Dashboard: <span className="text-primary">{userName}</span>
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground dark:text-foreground/80">
            Discover high-potential startups, manage your portfolio, and connect with founders.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Active Investments Value</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground dark:text-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${(totalInvestments/1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">
              Across {portfolio.filter(p => p.status !== 'Exited').length} active companies. (Mock)
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Avg. Portfolio ROI</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground dark:text-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{mockPotentialROI}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">
              Projected returns. (Mock)
            </p>
          </CardContent>
        </Card>
         <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Available Opportunities</CardTitle>
            <Zap className="h-5 w-5 text-muted-foreground dark:text-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{newOpportunitiesCount}</div>
            <p className="text-xs text-muted-foreground dark:text-foreground/60">
              Vetted ventures ready for review.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-card/80">
        <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> AI Due Diligence Assistant
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-foreground/70">
                Generate tailored due diligence questions for investment opportunities.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground dark:text-foreground/70 mb-3">
                Equip yourself with insightful questions before diving deeper into an investment.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
                <Link href="/due-diligence-questions">
                    Launch Question Generator <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><Zap className="text-primary h-6 w-6"/> Investment Opportunities</h2>
            <Button variant="outline" size="sm" onClick={() => handleAction('Filter Opportunities', 'System')} className="hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary">
                <Filter className="mr-2 h-4 w-4"/> Filter (Mock)
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {opportunities.map(opp => (
            <Card key={opp.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] group border-muted-foreground/20 dark:bg-card/80 dark:border-border">
              <CardHeader className="pb-3">
                 <div className="flex items-center gap-4 mb-3">
                    <Image src={opp.logoUrl} alt={`${opp.name} logo`} width={60} height={60} className="rounded-lg border-2 border-border group-hover:border-primary transition-colors" data-ai-hint={opp.aiHint} />
                    <div>
                        <CardTitle className="text-xl font-semibold text-foreground dark:text-foreground/90 group-hover:text-primary transition-colors">{opp.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground dark:text-foreground/70">{opp.industry} - <Badge variant="secondary" className="text-xs">{opp.stage}</Badge></CardDescription>
                    </div>
                </div>
                 <Badge variant="outline" className="w-fit text-primary border-primary group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">Asking: {opp.fundingAsk}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <p className="text-sm text-muted-foreground dark:text-foreground/70 h-16 overflow-hidden line-clamp-3">{opp.summary}</p>
                {opp.traction && <p className="text-xs font-medium text-primary/80 dark:text-primary/70"><strong className="text-muted-foreground dark:text-foreground/70">Traction:</strong> {opp.traction}</p>}
              </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2 pt-3">
                <Button variant="outline" size="sm" asChild className="hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary">
                  <Link href={opp.pitchDeckUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <FilePieChart className="mr-1.5 h-4 w-4 hidden sm:inline" /> Deck
                  </Link>
                </Button>
                <Button
                  variant={opp.watchlisted ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleToggleWatchlist(opp.id)}
                  className={`${opp.watchlisted ? "bg-primary/80 hover:bg-primary/90 text-primary-foreground group-hover:bg-primary/70" : "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground group-hover:bg-secondary/80"} `}
                >
                  <Eye className="mr-1.5 h-4 w-4 hidden sm:inline" /> {opp.watchlisted ? 'Watchlisted' : 'Watchlist'}
                </Button>
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/80 text-primary-foreground group-hover:bg-accent dark:group-hover:bg-accent group-hover:text-accent-foreground" onClick={() => handleAction('Connect with Founder', opp.name)}>
                  <LinkIcon className="mr-1.5 h-4 w-4 hidden sm:inline" /> Connect
                </Button>
              </CardFooter>
            </Card>
          ))}
          {opportunities.length === 0 && <Card className="lg:col-span-3 dark:bg-card/80"><CardContent className="pt-6 text-muted-foreground dark:text-foreground/70 text-center">No new investment opportunities at this time. Check back soon!</CardContent></Card>}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline text-foreground dark:text-foreground/90">My Portfolio</h2>
         {portfolio.map(comp => (
          <Card key={comp.id} className="mb-4 hover:shadow-lg transition-shadow group border-muted-foreground/20 dark:bg-card/80 dark:border-border">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image src={comp.logoUrl} alt={`${comp.name} logo`} width={48} height={48} className="rounded-md border-2 border-border group-hover:border-primary transition-colors" data-ai-hint={comp.aiHint} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground/90 group-hover:text-primary transition-colors">{comp.name}</h3>
                  <p className="text-xs text-muted-foreground dark:text-foreground/70">Initial: {comp.initialInvestment} | Current Value: <strong className="text-primary">{comp.currentValue}</strong></p>
                </div>
              </div>
               <div className="flex flex-col items-start sm:items-end gap-1">
                <Badge
                    variant={comp.status === 'Performing Well' ? 'default' : comp.status === 'Exited' ? 'outline' : 'secondary'}
                    className={`text-xs ${comp.status === 'Performing Well' ? 'bg-primary text-primary-foreground' : comp.status === 'Needs Review' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-500/50' : comp.status === 'Underperforming' ? 'bg-destructive text-destructive-foreground' : 'border-muted text-muted-foreground dark:border-border dark:text-foreground/70'}`}
                >
                    {comp.status}
                </Badge>
                <p className="text-xs text-muted-foreground dark:text-foreground/70">Last Update: {comp.lastUpdate}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pb-4 pr-4">
                 <Button variant="outline" size="sm" asChild className="hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary">
                    <Link href={comp.companyUrl || "#"} target="_blank" rel="noopener noreferrer">View Company</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/80 text-primary-foreground group-hover:bg-accent dark:group-hover:bg-accent group-hover:text-accent-foreground" onClick={() => handleAction('Request Update', comp.name)}>Request Update</Button>
            </CardFooter>
          </Card>
        ))}
        {portfolio.length === 0 && <Card className="dark:bg-card/80"><CardContent className="pt-6 text-muted-foreground dark:text-foreground/70 text-center">Your investment portfolio is empty. Start exploring opportunities!</CardContent></Card>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-secondary/30 dark:bg-secondary/20 border-border dark:border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-foreground dark:text-foreground/90"><Users className="text-primary"/>Founder Connections</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-foreground/70">Network with founders from your portfolio or prospects.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-start text-left hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary" onClick={() => handleAction('Explore Network', 'Founder Connections')}>Explore HeyTek Founder Network (Mock)</Button>
                <Button variant="outline" className="w-full justify-start text-left hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary" onClick={() => handleAction('Investor Events', 'System')}>Upcoming Investor Events (Mock)</Button>
            </CardContent>
        </Card>
        <Alert variant="default" className="bg-primary/10 dark:bg-primary/5 border-primary/30 dark:border-primary/20 text-primary dark:text-primary [&>svg]:text-primary hover:shadow-md transition-shadow">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-semibold">Investment Risks & Disclaimer</AlertTitle>
            <AlertDescription className="text-primary/80 dark:text-primary/70">
            Investing in early-stage startups is highly speculative and involves significant risks, including the potential loss of your entire investment. Diversify your portfolio, conduct thorough due diligence, and consult with financial advisors. This platform does not provide financial advice.
            </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
    
