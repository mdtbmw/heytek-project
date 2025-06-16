
import {
  LayoutDashboard,
  Lightbulb,
  Sparkles,
  Palette,
  Gavel,
  Package,
  LayoutTemplate,
  Presentation,
  ListChecks,
  Mic,
  HelpCircle,
  Briefcase,
  DollarSign,
  Code,
  HardHat, 
  Users, 
  FileText, 
  Building,
  FolderKanban, // Added FolderKanban for Asset Organizer
  MonitorPlay, // Added MonitorPlay for Website Generator
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  roles?: string[];
  keywords?: string[];
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
  roles?: string[];
}

export type NavigationStructure = (NavItem | NavGroup)[];

export const mainNavItems: NavigationStructure = [
  // Role-specific dashboards first
  { href: '/dashboard', label: 'Founder Dashboard', icon: LayoutDashboard, roles: ['founder_ceo'], keywords: ['dashboard', 'founder', 'main', 'home', 'overview', 'company structure', 'operations', 'assets'] },
  { href: '/tekker-dashboard', label: 'Tekker Dashboard', icon: Code, roles: ['tekker'], keywords: ['dashboard', 'tekker', 'implementer', 'builds', 'projects'] },
  { href: '/consultant-dashboard', label: 'Consultant Dashboard', icon: Briefcase, roles: ['brand_consultant'], keywords: ['dashboard', 'consultant', 'brand', 'strategy', 'clients'] },
  { href: '/investor-dashboard', label: 'Investor Dashboard', icon: DollarSign, roles: ['investor'], keywords: ['dashboard', 'investor', 'portfolio', 'deals', 'opportunities'] },
  
  {
    groupLabel: 'AI Company Builders',
    roles: ['founder_ceo'], 
    items: [
      { href: '/idea-extractor', label: 'AI Idea Igniter', icon: Lightbulb, keywords: ['idea', 'brainstorm', 'concept', 'sparky', 'refine', 'company idea'] },
      { href: '/name-generator', label: 'AI Business Name Generator', icon: Sparkles, keywords: ['name', 'company name', 'naming', 'domain'] },
      { href: '/brand-generator', label: 'AI Brand Identity Suite', icon: Palette, keywords: ['brand', 'branding', 'logo', 'tagline', 'vision', 'mission', 'company identity'] },
      { href: '/product-profile-generator', label: 'AI Product/Service Profile', icon: FileText, keywords: ['product', 'service', 'profile', 'pitch', 'description', 'usp'] },
      { href: '/pitch-deck-generator', label: 'AI Pitch Deck Outline', icon: Presentation, keywords: ['pitch', 'deck', 'investor pitch', 'presentation', 'slides', 'company pitch'] },
      { href: '/legal-setup', label: 'AI Legal Setup Guidance', icon: Gavel, keywords: ['legal', 'incorporation', 'registration', 'compliance', 'law', 'company formation'] },
    ],
  },
  {
    groupLabel: 'Company Assets & Growth',
    roles: ['founder_ceo'], 
    items: [
      { href: '/branding-package', label: 'Company Branding Kit', icon: Package, keywords: ['brand kit', 'assets', 'logo download', 'colors', 'company visual identity', 'website generator'] },
      // The "Company Blueprint (Conceptual)" now lives in the dashboard under "Structure" and "Assets" tabs.
      // We can keep a link here or remove it if the dashboard tabs are sufficient.
      // For now, I'll keep it, pointing to the dashboard, as it's a key concept.
      { href: '/dashboard?tab=company_assets', label: 'Company Asset Organizer', icon: FolderKanban, keywords: ['company blueprint', 'mvp', 'scaffold', 'template', 'boilerplate', 'starter project', 'operational structure', 'folder structure', 'file management'] },
      { href: '/mvp-scaffold', label: 'Digital Presence (Conceptual)', icon: MonitorPlay, keywords: ['website', 'landing page', 'digital presence', 'company site'] },
      { href: '/find-investors', label: 'Find Investors', icon: Users, keywords: ['investors', 'funding', 'networking', 'connect', 'capital', 'company funding'] },
    ],
  },
  {
    groupLabel: 'Tekker AI Tools',
    roles: ['tekker'],
    items: [
        { href: '/tekker-chat', label: 'Tekker AI Assistant', icon: HardHat, keywords: ['tekker', 'chat', 'plan', 'assistant', 'build help', 'troubleshoot'] },
        { href: '/implementation-planner', label: 'AI Implementation Planner', icon: ListChecks, keywords: ['tekker', 'plan', 'tasks', 'project plan', 'implementation'] },
    ],
  },
  {
    groupLabel: 'Consultant AI Tools',
    roles: ['brand_consultant'],
    items: [
        { href: '/brand-voice-tool', label: 'AI Brand Voice', icon: Mic, keywords: ['consultant', 'brand voice', 'archetype', 'tone'] },
    ],
  },
  {
    groupLabel: 'Investor AI Tools',
    roles: ['investor'],
    items: [
        { href: '/due-diligence-questions', label: 'AI Due Diligence Qs', icon: HelpCircle, keywords: ['investor', 'due diligence', 'questions', 'evaluation'] },
    ],
  },
];

// Flattened list for easier searching (used by Header search)
export const allNavItems: NavItem[] = mainNavItems.reduce((acc: NavItem[], item) => {
  if ('items' in item) {
    const group = item as NavGroup;
    if (group.items) {
        acc.push(...group.items.map(subItem => ({
            ...subItem,
            roles: subItem.roles || group.roles // Inherit roles from group if subItem doesn't specify
        })));
    }
  } else {
    acc.push(item as NavItem);
  }
  return acc;
}, []);
