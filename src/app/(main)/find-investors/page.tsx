
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Filter, Briefcase, BarChart3, ExternalLink, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/contexts/AuthContext'; // Assuming User type is exported
import type { InvestorPreferencesData } from '@/contexts/AgentOnboardingContext';

interface DisplayInvestor extends User {
  investorPreferences: InvestorPreferencesData; // Make it non-optional for display
}

export default function FindInvestorsPage() {
  const [investors, setInvestors] = useState<DisplayInvestor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    try {
      const usersString = localStorage.getItem('allHeytekUsers_mock');
      if (usersString) {
        const allUsers: User[] = JSON.parse(usersString);
        const fetchedInvestors = allUsers.filter(
          (user): user is DisplayInvestor => 
            user.primaryRole === 'investor' && user.investorPreferences !== undefined
        );
        setInvestors(fetchedInvestors);
      }
    } catch (error) {
      console.error("Error fetching investor data:", error);
      toast({
        title: "Error Loading Investors",
        description: "Could not retrieve investor profiles. Please try again later.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const handleRequestConnection = (investorName: string) => {
    toast({
      title: "Connection Request Sent (Mock)",
      description: `Your request to connect with ${investorName} has been notionally sent. They will be notified (mock).`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Users className="mr-2 h-6 w-6 text-primary" />
              Find Investors
            </CardTitle>
            <CardDescription>Loading potential investors...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground animate-pulse mx-auto" />
            <p className="text-muted-foreground mt-2">Searching for connections...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Find Investors
          </CardTitle>
          <CardDescription>
            Discover potential investors on HeyTek who align with your startup's vision. (Mock Data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => toast({ title: "Filter (Coming Soon)", description: "Advanced filtering for investors will be available soon."})}>
              <Filter className="mr-2 h-4 w-4" /> Filter Investors (Mock)
            </Button>
          </div>

          {investors.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Investors Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                It seems there are no investor profiles available at the moment. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((investor) => (
                <Card key={investor.email} className="flex flex-col hover:shadow-xl transition-shadow duration-300 group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 group-hover:border-primary transition-colors">
                        <AvatarImage src={`https://avatar.vercel.sh/${investor.username}.png?size=60`} alt={investor.username} />
                        <AvatarFallback className="bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          {investor.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">{investor.username}</CardTitle>
                        <CardDescription className="text-xs">HeyTek Investor</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                        <Briefcase className="mr-1.5 h-3.5 w-3.5 text-primary/80" /> Investment Focus:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {investor.investorPreferences.investmentSectors.slice(0,3).map((sector) => (
                          <Badge key={sector} variant="secondary" className="text-xs">{sector.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                        ))}
                        {investor.investorPreferences.investmentSectors.length > 3 && <Badge variant="secondary" className="text-xs">+{investor.investorPreferences.investmentSectors.length-3} more</Badge>}

                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                        <BarChart3 className="mr-1.5 h-3.5 w-3.5 text-primary/80" /> Preferred Stage:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {investor.investorPreferences.preferredStage.map((stage) => (
                          <Badge key={stage} variant="outline" className="text-xs border-primary/50 text-primary/90">
                            {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                     <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-0.5 flex items-center">
                        <DollarSign className="mr-1.5 h-3.5 w-3.5 text-primary/80" /> Typical Ticket Size:
                      </h4>
                      <p className="text-sm font-medium">{investor.investorPreferences.typicalTicketSize}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                      onClick={() => handleRequestConnection(investor.username)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> Request Connection (Mock)
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
       <Card className="mt-6 bg-secondary/50 dark:bg-card/70 border-border">
        <CardHeader>
          <CardTitle className="text-lg font-headline text-foreground">Tips for Connecting</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Ensure your startup profile and pitch deck outline are up-to-date on HeyTek.</li>
            <li>Personalize your connection request, mentioning why you think there's a mutual fit.</li>
            <li>Be prepared to discuss your idea, traction, and team clearly.</li>
            <li>Respect the investor's time and preferences.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
