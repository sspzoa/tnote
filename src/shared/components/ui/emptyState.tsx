import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { Button } from "./button";

type EmptyTone =
  | "primary"
  | "calendar"
  | "messages"
  | "retakes"
  | "assignments"
  | "students"
  | "courses"
  | "clinics"
  | "admins";

// Each tone = a soft gradient well + a matching icon color (feature chrome accent, not a tag color).
const toneStyles: Record<EmptyTone, string> = {
  primary: "from-primary-soft text-primary",
  calendar: "from-feature-calendar-soft text-feature-calendar",
  messages: "from-feature-messages-soft text-feature-messages",
  retakes: "from-feature-retakes-soft text-feature-retakes",
  assignments: "from-feature-assignments-soft text-feature-assignments",
  students: "from-feature-students-soft text-feature-students",
  courses: "from-feature-courses-soft text-feature-courses",
  clinics: "from-feature-clinics-soft text-feature-clinics",
  admins: "from-feature-admins-soft text-feature-admins",
};

interface EmptyStateProps {
  message: string;
  subtitle?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  tone?: EmptyTone;
}

export function EmptyState({ message, subtitle, actionLabel, onAction, icon, tone = "primary" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center md:py-20">
      {icon && (
        <div
          className={cn(
            "flex size-18 items-center justify-center rounded-2xl bg-gradient-to-br to-card ring-1 ring-border/70 [&_svg:not([class*='size-'])]:size-8",
            toneStyles[tone],
          )}>
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold text-base text-foreground">{message}</p>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <div className="pt-1">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
