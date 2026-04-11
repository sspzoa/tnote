"use client";

import { UserX } from "lucide-react";
import { useMemo } from "react";
import { Badge, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";
import type { RequiredAbsentItem } from "../(hooks)/useRequiredAbsent";

interface RequiredAbsentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: RequiredAbsentItem[];
  isLoading: boolean;
}

interface WeekGroup {
  weekStart: string;
  weekEnd: string;
  items: RequiredAbsentItem[];
}

const getWeekStart = (dateStr: string): Date => {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatYmd = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatWeekLabel = (weekStart: string, weekEnd: string): string => {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekEnd}T00:00:00`);
  const s = `${start.getMonth() + 1}/${start.getDate()}`;
  const e = `${end.getMonth() + 1}/${end.getDate()}`;
  return `${start.getFullYear()}년 ${s} - ${e}`;
};

const formatDayLabel = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" });
};

export default function RequiredAbsentPanel({ isOpen, onClose, data, isLoading }: RequiredAbsentPanelProps) {
  const weekGroups = useMemo<WeekGroup[]>(() => {
    const map = new Map<string, WeekGroup>();
    for (const item of data) {
      const monday = getWeekStart(item.attendance_date);
      const weekStart = formatYmd(monday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekEnd = formatYmd(sunday);

      const existing = map.get(weekStart);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(weekStart, { weekStart, weekEnd, items: [item] });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [data]);

  const totalStudents = useMemo(() => new Set(data.map((d) => d.student.id)).size, [data]);

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="필참 결석 학생"
      subtitle={totalStudents > 0 ? `${totalStudents}명 · ${data.length}건` : undefined}>
      {isLoading ? (
        <SkeletonSpinner className="py-spacing-900" size="md" />
      ) : weekGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-spacing-300 py-spacing-900">
          <div className="flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
            <UserX className="size-6 text-core-accent" />
          </div>
          <span className="text-content-standard-tertiary text-label">필참 결석 기록이 없습니다.</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {weekGroups.map((group) => {
            const uniqueStudents = new Set(group.items.map((i) => i.student.id)).size;
            return (
              <div key={group.weekStart} className="flex flex-col">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-600 py-spacing-300">
                  <span className="font-semibold text-content-standard-primary text-label">
                    {formatWeekLabel(group.weekStart, group.weekEnd)}
                  </span>
                  <Badge variant="danger" size="xs">
                    {uniqueStudents}명 · {group.items.length}건
                  </Badge>
                </div>
                <div className="divide-y divide-line-divider">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-spacing-100 px-spacing-600 py-spacing-300 transition-colors hover:bg-components-fill-standard-secondary">
                      <div className="flex items-center justify-between gap-spacing-200">
                        <div className="flex min-w-0 flex-wrap items-center gap-spacing-200">
                          <span className="font-semibold text-body text-content-standard-primary">
                            {item.student.name}
                          </span>
                          <Badge variant="danger" size="xs">
                            결석
                          </Badge>
                        </div>
                        <span className="shrink-0 text-content-standard-tertiary text-footnote">
                          {formatDayLabel(item.attendance_date)}
                        </span>
                      </div>
                      <div className="truncate text-content-standard-secondary text-footnote">{item.clinic.name}</div>
                      {item.student.school && (
                        <span className="text-content-standard-quaternary text-footnote">{item.student.school}</span>
                      )}
                      {item.note && (
                        <div className="truncate rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-300 py-spacing-200 text-content-standard-secondary text-footnote italic">
                          "{item.note}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SlidePanel>
  );
}
