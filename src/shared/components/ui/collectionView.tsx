"use client";

import { ListFilter, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface CollectionViewProps {
  /** Inline summary chips (counts) shown at the left of the toolbar. */
  summary?: ReactNode;
  /** Search field (controlled by the caller), rendered inline in the toolbar. */
  search?: ReactNode;
  /** Advanced filter controls revealed in a collapsible region under the toolbar. */
  filters?: ReactNode;
  /** Whether any advanced filter is active — highlights the 필터 toggle + shows reset. */
  filtersActive?: boolean;
  onResetFilters?: () => void;
  /** Toolbar-level trailing actions (rare; primary page actions live in PageView). */
  actions?: ReactNode;
  /** Start with the advanced-filter region open. */
  defaultFiltersOpen?: boolean;
  /** The flush table/list. */
  children: ReactNode;
  className?: string;
}

/**
 * The unified list archetype: a single bordered panel that fuses a toolbar (summary · search ·
 * filter toggle · actions), a collapsible advanced-filter region, and a flush table — replacing
 * the old "floating Header + MetricBadge row + FilterBar card + DataTable card" scaffold.
 */
export function CollectionView({
  summary,
  search,
  filters,
  filtersActive = false,
  onResetFilters,
  actions,
  defaultFiltersOpen = false,
  children,
  className,
}: CollectionViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(defaultFiltersOpen);
  const hasToolbar = summary || search || filters || actions;

  return (
    <section
      className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs", className)}>
      {hasToolbar && (
        <div className="flex flex-col gap-2.5 border-border border-b p-3 sm:flex-row sm:items-center">
          {summary && <div className="flex flex-wrap items-center gap-1.5">{summary}</div>}
          <div className="flex flex-1 items-center gap-2 sm:justify-end">
            {search && <div className="min-w-0 flex-1 sm:max-w-72">{search}</div>}
            {filters && (
              <button
                type="button"
                aria-pressed={filtersOpen}
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  "relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 font-medium text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  filtersOpen || filtersActive
                    ? "border-primary/30 bg-primary-soft text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                )}>
                <ListFilter className="size-4" />
                <span className="hidden sm:inline">필터</span>
                {filtersActive && <span className="size-1.5 rounded-full bg-primary" />}
              </button>
            )}
            {actions}
          </div>
        </div>
      )}

      {filters && filtersOpen && (
        <div className="flex flex-col gap-3 border-border border-b bg-muted/30 p-3">
          {filters}
          {filtersActive && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex w-fit items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground">
              <X className="size-3" />
              필터 초기화
            </button>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
