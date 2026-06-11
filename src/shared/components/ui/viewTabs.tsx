"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils/cn";

export interface ViewTabItem<T extends string> {
  value: T;
  label: string;
  /** Inline count — absorbs the old floating MetricBadge count row into the view spine. */
  count?: number;
  /** Tints the count pill on the active tab (e.g. warning for a pending queue). */
  tone?: "neutral" | "primary" | "warning" | "success" | "danger";
}

const tonePill: Record<NonNullable<ViewTabItem<string>["tone"]>, string> = {
  neutral:
    "bg-muted text-muted-foreground group-data-[state=active]/vt:bg-primary-soft group-data-[state=active]/vt:text-primary",
  primary: "bg-primary-soft text-primary",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-destructive-soft text-destructive",
};

/** A saved-view spine built on the Tabs primitive; each tab carries an inline count. */
export function ViewTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: ViewTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)} className={cn("w-full", className)}>
      <TabsList className="h-10 w-full max-w-full justify-start overflow-x-auto">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="group/vt min-w-fit flex-none gap-1.5">
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-semibold text-xs tabular-nums",
                  tonePill[item.tone ?? "neutral"],
                )}>
                {item.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
