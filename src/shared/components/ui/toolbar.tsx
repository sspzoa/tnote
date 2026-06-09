import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

/** A bordered filter card. Hosts FilterRow children (search inputs, selects, filter chips). */
export function FilterBar({
  label,
  children,
  className,
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs", className)}>
      {label != null && <span className="font-medium text-muted-foreground text-xs">{label}</span>}
      {children}
    </div>
  );
}

/** A horizontal, wrapping row of filter controls. */
export function FilterRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

/** A page-level toolbar that places a leading group (search/filters) and trailing actions on one line. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {children}
    </div>
  );
}
