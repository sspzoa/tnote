"use client";

import { ClipboardList } from "lucide-react";
import { Badge, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";
import type { RecentAttendanceItem } from "../(hooks)/useRecentAttendance";

interface ClinicHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: RecentAttendanceItem[];
  isLoading: boolean;
}

export default function ClinicHistoryPanel({ isOpen, onClose, attendance, isLoading }: ClinicHistoryPanelProps) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="최근 출석 기록" subtitle="최근 50건">
      {isLoading ? (
        <SkeletonSpinner className="py-16" size="md" />
      ) : attendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="size-6 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">출석 기록이 없습니다.</span>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {attendance.map((item) => {
            const date = new Date(`${item.attendance_date}T00:00:00`);
            const dateStr = date.toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });

            return (
              <div key={item.id} className="flex flex-col gap-2 px-7 py-4 transition-colors hover:bg-muted">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-base text-foreground">{item.student.name}</span>
                    {item.is_required ? (
                      <Badge variant="blue" size="xs">
                        필참
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="xs">
                        자율
                      </Badge>
                    )}
                    {item.status === "absent" ? (
                      <Badge variant="danger" size="xs">
                        결석
                      </Badge>
                    ) : (
                      <Badge variant="blue" size="xs">
                        출석
                      </Badge>
                    )}
                  </div>
                  <span className="shrink-0 text-muted-foreground text-xs">{dateStr}</span>
                </div>
                {(item.did_retake_exam || item.did_homework_check || item.did_qa) && (
                  <span className="text-muted-foreground text-xs">
                    {[
                      item.did_retake_exam && "재시험",
                      item.did_homework_check && "숙제검사",
                      item.did_qa && "질의응답",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                <div className="truncate text-muted-foreground text-sm">{item.clinic.name}</div>
                {item.student.school && <span className="text-muted-foreground/60 text-xs">{item.student.school}</span>}
                {item.note && (
                  <div className="truncate rounded-sm bg-muted px-3 py-2 text-muted-foreground text-xs italic">
                    "{item.note}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SlidePanel>
  );
}
