
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Lightbulb, Search, BookOpen, UserCircle, LayoutDashboard, Briefcase, DollarSign, Code, MessageSquare, ListChecks, Mic, HelpCircle, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  exact?: boolean; // For exact path matching
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.primaryRole || 'other'; // FIXED: Use primaryRole

  const getDashboardPath = () => {
    switch (userRole) {
      case 'founder_ceo': return '/dashboard';
      case 'tekker': return '/tekker-dashboard';
      case 'brand_consultant': return '/consultant-dashboard';
      case 'investor': return '/investor-dashboard';
      default: return '/dashboard';
    }
  };

  const dashboardPath = getDashboardPath();

  const navItems: NavItem[] = [
    { href: '/features', label: 'Features', icon: Search, roles: ['founder_ceo', 'tekker', 'brand_consultant', 'investor', 'other'] },
    {
      href: userRole === 'founder_ceo' ? '/idea-extractor'
          : userRole === 'tekker' ? '/implementation-planner'
          : userRole === 'brand_consultant' ? '/brand-voice-tool'
          : userRole === 'investor' ? '/due-diligence-questions'
          : '/idea-extractor',
      label: userRole === 'founder_ceo' ? 'AI Tools'
          : userRole === 'tekker' ? 'AI Plan'
          : userRole === 'brand_consultant' ? 'AI Voice'
          : userRole === 'investor' ? 'AI Due Dil'
          : 'AI Tools',
      icon: userRole === 'founder_ceo' ? Lightbulb
          : userRole === 'tekker' ? ListChecks
          : userRole === 'brand_consultant' ? Mic
          : userRole === 'investor' ? HelpCircle
          : Lightbulb,
      roles: ['founder_ceo', 'tekker', 'brand_consultant', 'investor', 'other']
    },
    { href: dashboardPath, label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: ['founder_ceo', 'tekker', 'brand_consultant', 'investor', 'other'] },
    { href: '/kb', label: 'Help', icon: BookOpen, roles: ['founder_ceo', 'tekker', 'brand_consultant', 'investor', 'other'] },
    { href: '#', label: 'More', icon: UsersIcon, roles: ['founder_ceo', 'tekker', 'brand_consultant', 'investor', 'other'] }, // Placeholder for more/profile
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));
  // Ensure there are always 5 items, or adjust logic if fewer items are desired
  const displayItems = filteredNavItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar text-sidebar-foreground border-t border-sidebar-border shadow-top-md md:hidden z-50">
      <div className="flex h-full items-center justify-around">
        {displayItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== dashboardPath || pathname === dashboardPath );
          const IconComponent = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "flex flex-col items-center justify-center h-full w-1/5 rounded-none p-1 group",
                "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50",
                isActive && "text-primary hover:text-primary dark:text-primary dark:hover:text-primary"
              )}
            >
              <Link href={item.href}>
                <div className={cn(
                    "p-1.5 rounded-full transition-all duration-200 ease-in-out",
                    isActive ? "bg-primary/10 dark:bg-primary/20" : "group-hover:bg-sidebar-accent/80 dark:group-hover:bg-sidebar-accent/70"
                )}>
                    <IconComponent className={cn("h-5 w-5", isActive ? "text-primary dark:text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")} />
                </div>
                <span className={cn("text-[10px] mt-0.5 truncate", isActive ? "font-semibold text-primary dark:text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")}>
                  {item.label}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
