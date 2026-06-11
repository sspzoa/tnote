"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { SectionCard } from "@/shared/components/ui/sectionCard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useUser } from "@/shared/hooks/useUser";
import { cn } from "@/shared/lib/utils/cn";
import type { CalendarEvent } from "@/shared/types";
import { useTodayEvents } from "../(hooks)/useTodayEvents";

type EventType = CalendarEvent["type"];

const TYPE_META: Record<EventType, { label: string; href: string; dot: string; order: number }> = {
  course: { label: "수업", href: "/courses", dot: "bg-feature-courses", order: 0 },
  clinic: { label: "클리닉", href: "/clinics", dot: "bg-feature-clinics", order: 1 },
  retake: { label: "재시험", href: "/retakes", dot: "bg-feature-retakes", order: 2 },
  assignment: { label: "과제", href: "/assignments", dot: "bg-feature-assignments", order: 3 },
};

const MAX_ROWS = 8;

export function TodayAgenda() {
  const { user, isStudent } = useUser();
  const { events, isLoading } = useTodayEvents(!isStudent && !!user);

  const sorted = [...events].sort((a, b) => {
    const byType = TYPE_META[a.type].order - TYPE_META[b.type].order;
    return byType !== 0 ? byType : a.title.localeCompare(b.title, "ko");
  });
  const visible = sorted.slice(0, MAX_ROWS);
  const overflow = sorted.length - visible.length;

  const action = (
    <Link
      href="/calendar"
      className="rounded-md px-2 py-1 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground">
      캘린더
    </Link>
  );

  if (isLoading) {
    return (
      <SectionCard title="오늘 일정" icon={Calendar} tone="calendar" action={action}>
        <div className="flex flex-col gap-1">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="size-2 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (sorted.length === 0) {
    return (
      <SectionCard
        title="오늘 일정"
        icon={Calendar}
        tone="calendar"
        action={action}
        isEmpty
        emptyMessage="오늘 예정된 일정이 없어요">
        {null}
      </SectionCard>
    );
  }

  return (
    <SectionCard title="오늘 일정" icon={Calendar} tone="calendar" action={action}>
      <div className="flex flex-col">
        {visible.map((event) => {
          const meta = TYPE_META[event.type];
          return (
            <Link
              key={`${event.type}-${event.id}`}
              href={meta.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent">
              <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">{event.title}</span>
              <span className="shrink-0 text-muted-foreground text-xs">{meta.label}</span>
            </Link>
          );
        })}
        {overflow > 0 && (
          <Link
            href="/calendar"
            className="rounded-lg px-3 py-2.5 text-center text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground">
            +{overflow}개 더 보기
          </Link>
        )}
      </div>
    </SectionCard>
  );
}
