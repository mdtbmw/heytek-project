
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { mainNavItems, type NavigationStructure, type NavItem, type NavGroup } from '@/lib/navigationItems';

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.primaryRole || 'other'; // FIXED: Use primaryRole

  const getFilteredNavItems = () => {
    return mainNavItems.filter(item => {
      return !item.roles || item.roles.includes(userRole);
    }).map(item => {
      if (item && 'groupLabel' in item && (item as NavGroup).items) {
        const filteredGroupItems = (item as NavGroup).items.filter(subItem => {
            return !subItem.roles || subItem.roles.includes(userRole);
        });
        if (filteredGroupItems.length > 0) {
            return { ...item, items: filteredGroupItems };
        }
        return null;
      }
      return item;
    }).filter(Boolean) as NavigationStructure;
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <nav className="flex flex-col h-full">
      <SidebarMenu>
        {filteredNavItems.map((item, index) => {
          if (item && 'groupLabel' in item && (item as NavGroup).items && (item as NavGroup).items.length > 0) {
            const GroupItem = item as NavGroup;
            return (
              <SidebarGroup key={index} className="pt-2">
                <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground dark:text-sidebar-foreground/70 tracking-wider group-data-[state=collapsed]:hidden">
                  {GroupItem.groupLabel}
                </SidebarGroupLabel>
                {GroupItem.items?.map((subItem) => {
                  const SubItemIcon = subItem.icon;
                  return (
                    <SidebarMenuItem key={subItem.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === subItem.href}
                        tooltip={subItem.label}
                        className={cn(
                            "justify-start gap-2.5",
                            pathname === subItem.href
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Link href={subItem.href}>
                          {SubItemIcon && <SubItemIcon className="h-5 w-5 shrink-0" />}
                          <span className="truncate group-data-[state=collapsed]:hidden">{subItem.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarGroup>
            );
          } else if (item && 'href' in item) {
            const SingleItem = item as NavItem;
            const ItemIcon = SingleItem.icon;
            return (
              <SidebarMenuItem key={SingleItem.href}>
                 <SidebarMenuButton
                    asChild
                    isActive={pathname === SingleItem.href}
                    tooltip={SingleItem.label}
                    className={cn(
                        "justify-start gap-2.5",
                         pathname === SingleItem.href
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground dark:hover:text-sidebar-accent-foreground"
                    )}
                  >
                  <Link href={SingleItem.href!}>
                    {ItemIcon && <ItemIcon className="h-5 w-5 shrink-0" />}
                    <span className="truncate group-data-[state=collapsed]:hidden">{SingleItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }
          return null;
        })}
      </SidebarMenu>
    </nav>
  );
}
