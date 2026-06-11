"use client";

import { ClipboardList, type LucideIcon, UserCheck, UserX } from "lucide-react";
import { FeedItem } from "@/shared/components/common/FeedItem";
import { Badge, type BadgeVariant, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import type { RecentAttendanceItem } from "../(hooks)/useRecentAttendance";

interface ClinicHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: RecentAttendanceItem[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<
  RecentAttendanceItem["status"],
  { label: string; variant: BadgeVariant; icon: LucideIcon; tone: FeatureTone }
> = {
  attended: { label: "출석", variant: "success", icon: UserCheck, tone: "clinics" },
  absent: { label: "결석", variant: "danger", icon: UserX, tone: "destructive" },
};

export default function ClinicHistoryPanel({ isOpen, onClose, attendance, isLoading }: ClinicHistoryPanelProps) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="최근 출석 기록" subtitle="최근 50건">
      {isLoading ? (
        <SkeletonSpinner className="py-16" size="md" />
      ) : attendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <ClipboardList className="size-6 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">출석 기록이 없습니다.</span>
        </div>
      ) : (
        <div className="px-4 py-4">
          {attendance.map((item, index) => {
            const config = STATUS_CONFIG[item.status];
            const date = new Date(`${item.attendance_date}T00:00:00`);
            const dateStr = date.toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });
            const activities = [
              item.did_retake_exam && "재시험",
              item.did_homework_check && "숙제검사",
              item.did_qa && "질의응답",
            ].filter(Boolean) as string[];

            return (
              <FeedItem
                key={item.id}
                icon={config.icon}
                tone={config.tone}
                rail={index !== attendance.length - 1}
                title={
                  <>
                    <span className="font-semibold text-foreground text-sm">{item.student.name}</span>
                    {item.is_required ? (
                      <Badge variant="blue" size="xs">
                        필참
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="xs">
                        자율
                      </Badge>
                    )}
                    <Badge variant={config.variant} size="xs">
                      {config.label}
                    </Badge>
                  </>
                }
                meta={`${dateStr} · ${item.clinic.name}`}
                description={item.student.school || undefined}>
                {activities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activities.map((activity) => (
                      <span
                        key={activity}
                        className="inline-flex w-fit items-center rounded-md bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                        {activity}
                      </span>
                    ))}
                  </div>
                )}
                {item.note && (
                  <p className="truncate border-border border-l-2 pl-2.5 text-muted-foreground text-xs italic">
                    "{item.note}"
                  </p>
                )}
              </FeedItem>
            );
          })}
        </div>
      )}
    </SlidePanel>
  );
}
