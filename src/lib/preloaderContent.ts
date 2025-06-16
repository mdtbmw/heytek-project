
import { Lightbulb, Presentation, RefreshCw, Wrench, Code, ListChecks, Users, BarChart3, DollarSign, Brain, Briefcase, ShieldCheck, Settings, MessageSquareHeart, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PreloaderMessage {
  text: string;
  icon: LucideIcon;
}

export const preloaderContent: Record<string, PreloaderMessage[]> = {
  default: [
    { text: "Optimizing your HeyTek experience...", icon: Settings },
    { text: "Brewing up something awesome for you!", icon: Brain },
    { text: "Almost there... great things take a moment!", icon: Briefcase },
    { text: "Sparking innovation... Please wait.", icon: Lightbulb },
  ],
  founder_ceo: [
    { text: "Igniting your next big idea... Hang tight!", icon: Lightbulb },
    { text: "Strategizing your path to success... Almost ready!", icon: Presentation },
    { text: "HeyTek Fact: Clear vision is key to startup success. We're getting things ready!", icon: MessageSquareHeart },
    { text: "Polishing your Founder dashboard...", icon: Wrench },
  ],
  tekker: [
    { text: "Assembling your Tekker toolkit...", icon: Wrench },
    { text: "Calibrating implementation matrix... Just a sec!", icon: Code },
    { text: "HeyTek Tip: Detailed planning makes for smooth Builds. Loading your workspace!", icon: ListChecks },
    { text: "Fetching latest Build opportunities...", icon: Briefcase },
  ],
  brand_consultant: [
    { text: "Sharpening your strategic insights...", icon: Users },
    { text: "Curating brand brilliance... Almost there!", icon: Brain },
    { text: "Consultant's Corner: Powerful brands tell compelling stories. Preparing your tools!", icon: Presentation },
    { text: "Loading client management dashboard...", icon: Briefcase },
  ],
  investor: [
    { text: "Scanning the horizon for unicorns...", icon: BarChart3 },
    { text: "Analyzing market trends for your next big win!", icon: DollarSign },
    { text: "Investor Insight: Due diligence is paramount. Getting your dashboard ready!", icon: ShieldCheck },
    { text: "Accessing portfolio data...", icon: Award },
  ],
};
