import type { ComponentType, ReactNode } from "react";
import { type FeatureTone, toneWell } from "@/shared/components/ui/featureTone";
import { cn } from "@/shared/lib/utils/cn";

interface FeedItemProps {
  /** Leading glyph rendered inside a tone-colored well (the timeline node). */
  icon: ComponentType<{ className?: string }>;
  tone?: FeatureTone;
  /** Primary line — name / subject + an inline status chip. */
  title: ReactNode;
  /** Trailing muted line — timestamp · author. */
  meta?: ReactNode;
  /** Secondary description line under the title. */
  description?: ReactNode;
  /** Detail chips / transition rows under the description. */
  children?: ReactNode;
  /** Draw the vertical timeline rail below the node (false on the last item). */
  rail?: boolean;
  className?: string;
}

/**
 * A timeline/log item — a tone-colored icon node on a connecting rail, a title row with trailing
 * meta, an optional description, and a slot for detail chips. The shared shape for every history /
 * activity feed across the app (retake/assignment/clinic history, consultations, message log).
 */
export function FeedItem({
  icon: Icon,
  tone = "neutral",
  title,
  meta,
  description,
  children,
  rail = true,
  className,
}: FeedItemProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex flex-col items-center">
        <span
          className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", toneWell[tone])}>
          <Icon />
        </span>
        {rail && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", rail ? "pb-5" : "pb-1")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">{title}</div>
          {meta && <span className="shrink-0 pt-0.5 text-muted-foreground text-xs tabular-nums">{meta}</span>}
        </div>
        {description && <div className="min-w-0 truncate text-muted-foreground text-sm">{description}</div>}
        {children}
      </div>
    </div>
  );
}

/** A compact "before → after" transition chip used inside FeedItem bodies. */
export function TransitionChip({
  from,
  to,
  tone = "neutral",
}: {
  from: ReactNode;
  to: ReactNode;
  tone?: "neutral" | "warning" | "success";
}) {
  const toneCls =
    tone === "warning"
      ? "bg-warning-soft text-warning"
      : tone === "success"
        ? "bg-success-soft text-success"
        : "bg-muted text-foreground";
  return (
    <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs", toneCls)}>
      <span className="text-muted-foreground line-through decoration-muted-foreground/40">{from}</span>
      <span className="opacity-50">→</span>
      <span className="font-medium">{to}</span>
    </span>
  );
}
