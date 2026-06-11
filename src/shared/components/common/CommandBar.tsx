"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils/cn";
import { usePageChrome } from "./pageChrome";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const SEG_LABELS: Record<string, string> = {
  calendar: "캘린더",
  messages: "문자 관리",
  retakes: "재시험 관리",
  assignments: "과제 관리",
  students: "학생 관리",
  courses: "수업 관리",
  clinics: "클리닉 관리",
  admins: "관리자 관리",
};

const MY_LABELS: Record<string, string> = {
  calendar: "내 캘린더",
  courses: "시험 현황",
  assignments: "과제 현황",
  clinics: "클리닉 출석",
  retakes: "재시험 현황",
};

interface Crumb {
  label: string;
  href?: string;
}

function deriveCrumbs(pathname: string, recordCrumb: string | null): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "오늘" }];

  if (segments[0] === "my") {
    return [{ label: MY_LABELS[segments[1]] ?? "내 정보" }];
  }

  const root = segments[0];
  const rootLabel = SEG_LABELS[root] ?? root;
  const isDetail = segments.length > 1;
  const crumbs: Crumb[] = [{ label: rootLabel, href: isDetail ? `/${root}` : undefined }];
  if (isDetail) crumbs.push({ label: recordCrumb ?? "상세" });
  return crumbs;
}

/**
 * Persistent contextual top band of the app frame. Renders the sidebar trigger, a pathname-derived
 * breadcrumb (+ optional record crumb), the page's teleported primary action, theme, and the account
 * menu. Replaces the near-empty AppHeader so the dead header becomes the app's verb bar.
 */
export function CommandBar() {
  const pathname = usePathname();
  const { setActionSlot, crumb } = usePageChrome();
  const crumbs = deriveCrumbs(pathname, crumb);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-border border-b bg-background/85 px-3 backdrop-blur-md md:px-4 print:hidden">
      <SidebarTrigger className="shrink-0 text-muted-foreground" />
      <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />}
              {c.href && !last ? (
                <Link href={c.href} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className={cn("truncate", last ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {c.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {/* Page-action slot — pages teleport their primary CTA here via <PageShell actions>. */}
        <div ref={setActionSlot} className="flex items-center gap-2 empty:hidden" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
