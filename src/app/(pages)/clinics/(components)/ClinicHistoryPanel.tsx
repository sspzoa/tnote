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
        <SkeletonSpinner className="py-spacing-900" size="md" />
      ) : attendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-spacing-300 py-spacing-900">
          <div className="flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
            <ClipboardList className="size-6 text-core-accent" />
          </div>
          <span className="text-content-standard-tertiary text-label">출석 기록이 없습니다.</span>
        </div>
      ) : (
        <div className="divide-y divide-line-divider">
          {attendance.map((item) => {
            const date = new Date(`${item.attendance_date}T00:00:00`);
            const dateStr = date.toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });

            return (
              <div
                key={item.id}
                className="flex flex-col gap-spacing-200 px-spacing-600 py-spacing-400 transition-colors hover:bg-components-fill-standard-secondary">
                <div className="flex items-center justify-between gap-spacing-200">
                  <div className="flex items-center gap-spacing-200">
                    <span className="font-semibold text-body text-content-standard-primary">{item.student.name}</span>
                    <Badge variant="blue" size="xs">
                      출석
                    </Badge>
                  </div>
                  <span className="shrink-0 text-content-standard-tertiary text-footnote">{dateStr}</span>
                </div>
                <div className="truncate text-content-standard-secondary text-label">{item.clinic.name}</div>
                {item.student.school && (
                  <span className="text-content-standard-quaternary text-footnote">{item.student.school}</span>
                )}
                {item.note && (
                  <div className="truncate rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-300 py-spacing-200 text-content-standard-secondary text-footnote italic">
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
