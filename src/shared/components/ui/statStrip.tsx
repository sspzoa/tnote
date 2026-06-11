import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface StatStripItem {
  label: string;
  value: ReactNode;
  /** Deep-link the metric into a pre-filtered list. */
  href?: string;
  /** Pull focus (e.g. a pending count) with the brand color. */
  emphasis?: boolean;
}

/**
 * A compact metric ribbon — tabular values with hairline separators — that demotes counts to chrome.
 * Horizontal: the dashboard KPI strip / page header ribbon. Vertical: the detail MetaSidebar block.
 */
export function StatStrip({
  items,
  orientation = "horizontal",
  className,
}: {
  items: StatStripItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const horizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        horizontal ? "flex flex-wrap items-stretch gap-y-2" : "flex flex-col",
        horizontal ? "rounded-xl border border-border bg-card px-1 py-2 shadow-xs" : "",
        className,
      )}>
      {items.map((item, i) => {
        const inner = horizontal ? (
          <>
            <span
              className={cn(
                "font-bold text-xl tabular-nums tracking-[-0.01em]",
                item.emphasis ? "text-primary" : "text-foreground",
              )}>
              {item.value}
            </span>
            <span className="text-muted-foreground text-xs">{item.label}</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground text-sm">{item.label}</span>
            <span
              className={cn("font-semibold text-sm tabular-nums", item.emphasis ? "text-primary" : "text-foreground")}>
              {item.value}
            </span>
          </>
        );

        const cls = cn(
          horizontal
            ? "flex items-baseline gap-1.5 border-border border-l px-3.5 first:border-l-0"
            : "flex items-center justify-between border-border border-b py-2.5 last:border-b-0",
          item.href && "transition-colors hover:text-primary",
        );

        return item.href ? (
          <Link key={`${item.label}-${i}`} href={item.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <div key={`${item.label}-${i}`} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
