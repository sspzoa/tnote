import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

/**
 * Profile band for a detail page — a bordered card with an identity cluster (avatar + title +
 * meta) on the left and actions on the right. Replaces the standalone Header on detail screens.
 */
export function DetailHeader({
  avatar,
  title,
  badges,
  meta,
  actions,
  className,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  badges?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-start sm:justify-between print:rounded-none print:border-0 print:border-border print:border-b print:bg-white print:p-0 print:pb-3 print:shadow-none",
        className,
      )}>
      <div className="flex min-w-0 items-start gap-4">
        {avatar}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {title}
            {badges}
          </div>
          {meta && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">{meta}</div>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 print:hidden">{actions}</div>}
    </div>
  );
}

/**
 * Two-column overview grid for detail pages: a wide main column and a narrower meta sidebar
 * that collapses to a single column on smaller screens (and for print). Replaces the long
 * single-column stack of identical section cards.
 */
export function DetailGrid({ main, aside, className }: { main: ReactNode; aside: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] print:block print:gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-5 print:gap-3">{main}</div>
      <aside className="flex flex-col gap-5 print:gap-3">{aside}</aside>
    </div>
  );
}
