import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { type FeatureTone, toneWell } from "./featureTone";

interface SectionCardProps {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: FeatureTone;
  action?: ReactNode;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Render children flush (e.g. a table) instead of inside a padded body. */
  noPadding?: boolean;
  className?: string;
}

/** Section container — crisp bordered card with a colored icon-well header. */
export function SectionCard({
  title,
  icon: Icon,
  tone = "primary",
  action,
  children,
  isEmpty,
  emptyMessage = "내용이 없습니다.",
  noPadding,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs print:rounded-none print:border print:shadow-none",
        className,
      )}>
      <div className="flex items-center justify-between gap-2 px-5 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className={cn("flex size-8 items-center justify-center rounded-lg [&_svg]:size-4", toneWell[tone])}>
              <Icon />
            </span>
          )}
          <h3 className="font-semibold text-base text-foreground tracking-[-0.01em]">{title}</h3>
        </div>
        {action}
      </div>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-1 px-5 pb-8 text-center text-muted-foreground text-sm">
          {emptyMessage}
        </div>
      ) : noPadding ? (
        children
      ) : (
        <div className="px-5 pb-5">{children}</div>
      )}
    </div>
  );
}
