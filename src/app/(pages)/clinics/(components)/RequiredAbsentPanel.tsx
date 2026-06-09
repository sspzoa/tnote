"use client";

import { Check, UserX } from "lucide-react";
import { useMemo } from "react";
import { Badge, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";
import type { RequiredAbsentItem, VoluntaryAttendanceItem } from "../(hooks)/useRequiredAbsent";

interface RequiredAbsentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: RequiredAbsentItem[];
  voluntaryAttendance: VoluntaryAttendanceItem[];
  isLoading: boolean;
}

interface WeekGroup {
  weekStart: string;
  weekEnd: string;
  items: RequiredAbsentItem[];
}

/** 금요일 기준 주 시작일 (금~목) */
const getFridayWeekStart = (dateStr: string): Date => {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay(); // 0=일, 1=월, ..., 5=금, 6=토
  // 금요일(5)로부터의 오프셋 계산
  const diff = day >= 5 ? day - 5 : day + 2; // 금=0, 토=1, 일=2, 월=3, 화=4, 수=5, 목=6
  date.setDate(date.getDate() - diff);
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
  return `${start.getFullYear()}년 ${s}(금) - ${e}(목)`;
};

const formatDayLabel = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" });
};

export default function RequiredAbsentPanel({
  isOpen,
  onClose,
  data,
  voluntaryAttendance,
  isLoading,
}: RequiredAbsentPanelProps) {
  // 금~목 기준으로 그룹핑
  const weekGroups = useMemo<WeekGroup[]>(() => {
    const map = new Map<string, WeekGroup>();
    for (const item of data) {
      const friday = getFridayWeekStart(item.attendance_date);
      const weekStart = formatYmd(friday);
      const thursday = new Date(friday);
      thursday.setDate(friday.getDate() + 6);
      const weekEnd = formatYmd(thursday);

      const existing = map.get(weekStart);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(weekStart, { weekStart, weekEnd, items: [item] });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [data]);

  // 학생ID+주 → 자율 출석 기록 매핑
  const voluntaryByStudentWeek = useMemo(() => {
    const map = new Map<string, VoluntaryAttendanceItem[]>();
    for (const item of voluntaryAttendance) {
      const friday = getFridayWeekStart(item.attendance_date);
      const weekKey = formatYmd(friday);
      const key = `${item.student.id}_${weekKey}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return map;
  }, [voluntaryAttendance]);

  const totalStudents = useMemo(() => new Set(data.map((d) => d.student.id)).size, [data]);

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="필참 결석 학생"
      subtitle={totalStudents > 0 ? `${totalStudents}명 · ${data.length}건` : undefined}>
      {isLoading ? (
        <SkeletonSpinner className="py-16" size="md" />
      ) : weekGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UserX className="size-6 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">필참 결석 기록이 없습니다.</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {weekGroups.map((group) => {
            const uniqueStudents = new Set(group.items.map((i) => i.student.id)).size;
            return (
              <div key={group.weekStart} className="flex flex-col">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-border border-b bg-muted px-4 py-2.5">
                  <span className="font-semibold text-foreground text-sm">
                    {formatWeekLabel(group.weekStart, group.weekEnd)}
                  </span>
                  <Badge variant="danger" size="xs">
                    {uniqueStudents}명 · {group.items.length}건
                  </Badge>
                </div>
                <div className="divide-y divide-border">
                  {group.items.map((item) => {
                    const volKey = `${item.student.id}_${group.weekStart}`;
                    const volRecords = voluntaryByStudentWeek.get(volKey);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1 px-4 py-2.5 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">{item.student.name}</span>
                            <Badge variant="danger" size="xs">
                              결석
                            </Badge>
                          </div>
                          <span className="shrink-0 text-muted-foreground text-xs">
                            {formatDayLabel(item.attendance_date)}
                          </span>
                        </div>
                        <div className="truncate text-muted-foreground text-xs">{item.clinic.name}</div>
                        {item.student.school && (
                          <span className="text-muted-foreground/60 text-xs">{item.student.school}</span>
                        )}
                        {item.note && (
                          <div className="truncate rounded-sm bg-muted px-3 py-2 text-muted-foreground text-xs italic">
                            "{item.note}"
                          </div>
                        )}
                        {volRecords && volRecords.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 rounded-sm bg-solid-translucent-green px-2 py-1">
                              <Check className="size-3 text-success" />
                              <span className="text-[10px] leading-4 text-success">자율 참석</span>
                            </div>
                            {volRecords.map((vol) => (
                              <span
                                key={vol.id}
                                className="rounded-sm bg-muted px-2 py-1 text-[10px] leading-4 text-muted-foreground">
                                {formatDayLabel(vol.attendance_date)} · {vol.clinic.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SlidePanel>
  );
}
