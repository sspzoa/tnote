import { CalendarClock } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import type { Retake } from "../(atoms)/useRetakesStore";

/**
 * Shared retake status → {label, Badge variant} map. Single source of truth for the four
 * action-confirm modals (complete / absent / postpone / edit-date) and the record summary band,
 * so the "대기중 / 완료 / 결석" vocabulary never drifts between them.
 */
export const RETAKE_STATUS_CONFIG: Record<Retake["status"], { label: string; variant: BadgeVariant }> = {
  pending: { label: "대기중", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  absent: { label: "결석", variant: "danger" },
};

interface RetakeRecordSummaryProps {
  retake: Retake;
  /**
   * The action being confirmed — drives the accent IconBadge well/icon so the summary reads
   * as the action's surface (e.g. a success CircleCheck for 완료).
   */
  accentIcon: React.ComponentType<{ className?: string }>;
  accentTone: FeatureTone;
  /** Override the trailing date label (defaults to "예정일"). */
  dateLabel?: string;
  /** Override the rendered date (defaults to the retake's current scheduled date). */
  dateValue?: ReactNode;
}

/**
 * The RECORD SUMMARY band for retake action-confirm modals: an accent IconBadge + the student
 * Avatar/name, the course·exam·회차 context, the current status Badge, and a labeled 예정일 meta row.
 * Replaces the old " - "-joined subtitle string + bare bordered date box so the user always sees
 * WHO / WHICH exam / current state before acting.
 */
export function RetakeRecordSummary({
  retake,
  accentIcon: AccentIcon,
  accentTone,
  dateLabel = "예정일",
  dateValue,
}: RetakeRecordSummaryProps) {
  const status = RETAKE_STATUS_CONFIG[retake.status];
  const resolvedDate = dateValue ?? retake.current_scheduled_date ?? "미지정";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-start gap-3">
        <IconBadge icon={AccentIcon} tone={accentTone} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-base text-foreground">{retake.student.name}</span>
            {status && (
              <Badge variant={status.variant} size="sm" className="ml-auto shrink-0">
                {status.label}
              </Badge>
            )}
          </div>
          <div className="truncate text-muted-foreground text-sm">
            <span className="text-foreground">
              {retake.exam.name} ({retake.exam.exam_number}회차)
            </span>
            <span className="mx-1.5 text-muted-foreground/50">·</span>
            {retake.exam.course.name}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-border/70 border-t pt-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="size-4" />
          {dateLabel}
        </span>
        <span className="font-medium text-foreground tabular-nums">{resolvedDate}</span>
      </div>
    </div>
  );
}
