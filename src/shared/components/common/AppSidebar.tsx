"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useHomeStats } from "@/shared/hooks/useHomeStats";
import { useUser } from "@/shared/hooks/useUser";
import { adminNavItems, studentNavItems } from "@/shared/lib/nav";

// Admin nav grouped into friendly sections (route paths unchanged).
const ADMIN_NAV_GROUPS: { label: string; hrefs: string[] }[] = [
  { label: "소통", hrefs: ["/calendar", "/messages"] },
  { label: "학습 관리", hrefs: ["/retakes", "/assignments"] },
  { label: "학생", hrefs: ["/students", "/courses", "/clinics"] },
  { label: "설정", hrefs: ["/admins"] },
];

const adminNavGroups = ADMIN_NAV_GROUPS.map((group) => ({
  label: group.label,
  items: group.hrefs
    .map((href) => adminNavItems.find((item) => item.href === href))
    .filter(Boolean) as typeof adminNavItems,
}));

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, isLoading, isAdmin } = useUser();
  // Work-queue counts (shared cache with the dashboard); admin-only, never fires for students.
  const { stats } = useHomeStats(isAdmin && !!user);

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const countFor = (href: string): number => {
    if (!isAdmin || !stats) return 0;
    if (href === "/retakes") return stats.pendingRetakeCount;
    if (href === "/assignments") return stats.pendingAssignmentTaskCount;
    return 0;
  };

  const renderNavItem = (item: (typeof adminNavItems)[number]) => {
    const active = isActive(item.href);
    const count = countFor(item.href);
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="rounded-md">
          <Link href={item.href} onClick={() => setOpenMobile(false)}>
            <item.icon />
            <span className="truncate">{item.label}</span>
            {count > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft px-1.5 font-semibold text-primary text-xs tabular-nums group-data-[collapsible=icon]:hidden">
                {count}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-base text-primary-foreground shadow-brand">
                  T
                </span>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold text-base tracking-[-0.01em]">Tnote</span>
                  {isLoading ? (
                    <Skeleton className="mt-0.5 h-3 w-16" />
                  ) : (
                    user?.workspaceName && (
                      <span className="truncate text-muted-foreground text-xs">{user.workspaceName}</span>
                    )
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <SidebarGroup>
            <SidebarMenu>
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
                <SidebarMenuItem key={i}>
                  <div className="flex h-8 items-center gap-2 rounded-md px-2">
                    <Skeleton className="size-4 shrink-0 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : isAdmin ? (
          adminNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>{group.items.map(renderNavItem)}</SidebarMenu>
            </SidebarGroup>
          ))
        ) : (
          <SidebarGroup>
            <SidebarMenu>{navItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
