import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { type FeatureTone, toneWell } from "./featureTone";

type DeltaDirection = "up" | "down" | "neutral";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  subValue?: ReactNode;
  /** Colored icon-well tone (feature or semantic). */
  tone?: FeatureTone;
  /** Optional delta pill (e.g. week-over-week change). */
  delta?: { value: string; direction: DeltaDirection };
  /** Optional sparkline/chart slot — pass a chart only where real time-series data exists. */
  chart?: ReactNode;
  /** When set, the whole tile becomes a Link and gains the sanctioned hover lift. */
  href?: string;
  className?: string;
}

const deltaTone: Record<DeltaDirection, string> = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

const DeltaIcon = { up: ArrowUp, down: ArrowDown, neutral: Minus } as const;

/**
 * Stat card — crisp bordered white surface, big bold tabular metric, a single colored icon well.
 * Drives the home dashboard, list-page summary rows, and detail headers.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  tone = "primary",
  delta,
  chart,
  href,
  className,
}: StatCardProps) {
  const Delta = delta ? DeltaIcon[delta.direction] : null;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium text-muted-foreground text-sm">{label}</span>
        <span
          className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5", toneWell[tone])}>
          <Icon />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-3xl text-foreground tabular-nums tracking-[-0.02em]">{value}</span>
          {subValue && <span className="text-muted-foreground text-xs">{subValue}</span>}
        </div>
        {delta && Delta && (
          <span
            className={cn("flex items-center gap-0.5 font-semibold text-xs tabular-nums", deltaTone[delta.direction])}>
            <Delta className="size-3.5" />
            {delta.value}
          </span>
        )}
      </div>
      {chart && <div className="mt-1">{chart}</div>}
    </>
  );

  const base = "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "hover:-translate-y-0.5 transition-[box-shadow,transform] duration-[--motion-base] ease-[--ease-out-soft] hover:shadow-md",
          className,
        )}>
        {body}
      </Link>
    );
  }

  return <div className={cn(base, className)}>{body}</div>;
}

// Backwards-compatible alias — earlier code imports `StatTile`.
export { StatCard as StatTile };
