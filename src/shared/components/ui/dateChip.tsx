import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface DateChipProps {
  children: ReactNode;
  className?: string;
}

/** A compact date/identifier chip — the one sanctioned bg-primary/10 emphasis use, with tabular figures. */
export function DateChip({ children, className }: DateChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary text-xs tabular-nums",
        className,
      )}>
      {children}
    </span>
  );
}
