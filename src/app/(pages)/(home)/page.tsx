"use client";

import { createTypeStream } from "hangul-typing-animation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ClipboardList,
  FileCheck,
  MessageSquare,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { PageShell } from "@/shared/components/common/PageShell";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import { toneWell } from "@/shared/components/ui/featureTone";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatStrip } from "@/shared/components/ui/statStrip";
import { useHomeStats } from "@/shared/hooks/useHomeStats";
import { useUser } from "@/shared/hooks/useUser";
import { cn } from "@/shared/lib/utils/cn";
import { getGreetingByTime } from "@/shared/lib/utils/date";
import { TodayAgenda } from "./(components)/TodayAgenda";

const useHangulTyping = (text: string) => {
  const [displayText, setDisplayText] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!text || hasRun.current) return;
    hasRun.current = true;
    const typeStream = createTypeStream({ perChar: 30, perHangul: 60, perSpace: 20, perDot: 200 });
    typeStream(text, (typing) => setDisplayText(typing));
  }, [text]);

  return displayText;
};

/** An action-first queue card: count + CTA into a pre-filtered list, or a positive empty state. */
function QueueCard({
  icon: Icon,
  tone,
  title,
  count,
  href,
  cta,
  emptyLabel,
}: {
  icon: ComponentType<{ className?: string }>;
  tone: FeatureTone;
  title: string;
  count: number;
  href: string;
  cta: string;
  emptyLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-[box-shadow,transform,border-color] duration-[--motion-base] ease-[--ease-out-soft] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-10 items-center justify-center rounded-lg [&_svg]:size-5", toneWell[tone])}>
          <Icon />
        </span>
        <span className="font-bold text-3xl text-foreground tabular-nums tracking-[-0.02em]">{count}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-base text-foreground">{title}</span>
          <span className="text-muted-foreground text-sm">{count > 0 ? cta : emptyLabel}</span>
        </div>
        {count > 0 && (
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        )}
      </div>
    </Link>
  );
}

const QUICK_LINKS: { href: string; icon: ComponentType<{ className?: string }>; label: string; tone: FeatureTone }[] = [
  { href: "/students", icon: Users, label: "학생 관리", tone: "students" },
  { href: "/messages", icon: MessageSquare, label: "문자 보내기", tone: "messages" },
  { href: "/courses", icon: BookOpen, label: "수업 관리", tone: "courses" },
  { href: "/calendar", icon: Calendar, label: "캘린더", tone: "calendar" },
];

export default function Home() {
  const { user, isLoading: userLoading, isStudent } = useUser();
  const { stats, isLoading: statsLoading } = useHomeStats(!isStudent && !!user);
  const isLoading = userLoading || (!isStudent && statsLoading);
  const greeting = getGreetingByTime();
  const typedGreeting = useHangulTyping(isLoading ? "" : greeting);

  if (isLoading) {
    return (
      <PageShell title="대시보드">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-xl lg:col-span-2" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </PageShell>
    );
  }

  const title = `안녕하세요, ${user?.name || "사용자"}님`;

  if (isStudent) {
    return (
      <PageShell title={title} subtitle={typedGreeting || " "} width="narrow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              {
                href: "/my/courses",
                icon: BookOpen,
                label: "시험 현황",
                description: "시험 성적 확인",
                tone: "courses",
              },
              {
                href: "/my/assignments",
                icon: FileCheck,
                label: "과제 현황",
                description: "과제 제출 현황",
                tone: "assignments",
              },
              {
                href: "/my/retakes",
                icon: ClipboardList,
                label: "재시험 현황",
                description: "재시험 일정 확인",
                tone: "retakes",
              },
              {
                href: "/my/clinics",
                icon: Stethoscope,
                label: "클리닉",
                description: "클리닉 출석 현황",
                tone: "clinics",
              },
              { href: "/calendar", icon: Calendar, label: "캘린더", description: "내 일정 확인", tone: "calendar" },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-[box-shadow,transform,border-color] duration-[--motion-base] ease-[--ease-out-soft] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <IconBadge icon={item.icon} tone={item.tone} />
              <div className="flex flex-col gap-0.5">
                <div className="font-semibold text-base text-foreground">{item.label}</div>
                <div className="text-muted-foreground text-sm">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={title}
      subtitle={typedGreeting || " "}
      stats={
        <StatStrip
          items={[
            { label: "수업", value: stats?.courseCount ?? 0, href: "/courses" },
            { label: "학생", value: stats?.studentCount ?? 0, href: "/students" },
            { label: "대기 재시험", value: stats?.pendingRetakeCount ?? 0, emphasis: true, href: "/retakes" },
            {
              label: "검사 대기 과제",
              value: stats?.pendingAssignmentTaskCount ?? 0,
              emphasis: true,
              href: "/assignments",
            },
            { label: "운영 클리닉", value: stats?.activeClinicCount ?? 0, href: "/clinics" },
          ]}
        />
      }>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="font-semibold text-base text-foreground">처리 대기</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <QueueCard
              icon={ClipboardList}
              tone="retakes"
              title="재시험"
              count={stats?.pendingRetakeCount ?? 0}
              href="/retakes"
              cta="대기 중인 재시험 처리하기"
              emptyLabel="대기 중인 재시험이 없어요"
            />
            <QueueCard
              icon={FileCheck}
              tone="assignments"
              title="과제 검사"
              count={stats?.pendingAssignmentTaskCount ?? 0}
              href="/assignments"
              cta="검사 대기 과제 확인하기"
              emptyLabel="검사할 과제가 없어요"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-base text-foreground">바로가기</h2>
          <Card className="flex-1">
            <CardContent className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent">
                  <IconBadge icon={link.icon} tone={link.tone} size="sm" />
                  <span className="font-medium text-foreground text-sm">{link.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <TodayAgenda />
    </PageShell>
  );
}
