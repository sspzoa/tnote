"use client";

import { createTypeStream } from "hangul-typing-animation";
import { BarChart3, BookOpen, Calendar, ClipboardList, FileCheck, Sparkles, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/shared/components/common/Container";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/ui/emptyState";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatTile } from "@/shared/components/ui/statTile";
import { useUser } from "@/shared/hooks/useUser";
import { getGreetingByTime } from "@/shared/lib/utils/date";
import { WorkspaceOverviewChart } from "./(components)/WorkspaceOverviewChart";
import { useHomeStats } from "./(hooks)/useHomeStats";

const useHangulTyping = (text: string) => {
  const [displayText, setDisplayText] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!text || hasRun.current) return;
    hasRun.current = true;

    const typeStream = createTypeStream({
      perChar: 30,
      perHangul: 60,
      perSpace: 20,
      perDot: 200,
    });

    typeStream(text, (typing) => {
      setDisplayText(typing);
    });
  }, [text]);

  return displayText;
};

export default function Home() {
  const { user, isLoading: userLoading, isStudent } = useUser();
  const { stats, isLoading: statsLoading } = useHomeStats(!isStudent && !!user);
  const isLoading = userLoading || (!isStudent && statsLoading);
  const greeting = getGreetingByTime();
  const typedGreeting = useHangulTyping(isLoading ? "" : greeting);

  if (isLoading) {
    return (
      <Container>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-8 w-40 rounded-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="size-7 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Card>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </Container>
    );
  }

  const statItems: {
    href: string;
    icon: typeof BookOpen;
    value: number;
    label: string;
    description: string;
    tone: FeatureTone;
  }[] = [
    {
      href: "/courses",
      icon: BookOpen,
      value: stats?.courseCount || 0,
      label: "수업",
      description: "진행 중인 수업",
      tone: "courses",
    },
    {
      href: "/students",
      icon: Users,
      value: stats?.studentCount || 0,
      label: "학생",
      description: "등록된 학생 수",
      tone: "students",
    },
    {
      href: "/retakes",
      icon: ClipboardList,
      value: stats?.pendingRetakeCount || 0,
      label: "재시험",
      description: "대기 중인 재시험",
      tone: "retakes",
    },
    {
      href: "/assignments",
      icon: FileCheck,
      value: stats?.pendingAssignmentTaskCount || 0,
      label: "과제",
      description: "대기 중인 과제",
      tone: "assignments",
    },
    {
      href: "/clinics",
      icon: Stethoscope,
      value: stats?.activeClinicCount || 0,
      label: "클리닉",
      description: "운영 중인 클리닉",
      tone: "clinics",
    },
  ];

  const chartData = statItems.map((item) => ({ label: item.label, value: item.value }));
  const allZero = chartData.every((d) => d.value === 0);

  return (
    <Container>
      <Card className="border-transparent bg-gradient-to-br from-primary-soft to-card">
        <CardContent className="flex flex-col gap-3">
          <h1 className="break-words font-bold text-2xl text-foreground tracking-[-0.02em]">
            안녕하세요,
            <br className="md:hidden" /> <span className="text-primary">{user?.name || "사용자"}</span>님
          </h1>
          <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <p className="text-primary text-xs">{typedGreeting || " "}</p>
          </div>
        </CardContent>
      </Card>

      {!isStudent && stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statItems.map((item) => (
              <StatTile
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                value={item.value}
                subValue={item.description}
                tone={item.tone}
              />
            ))}
          </div>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-sm tracking-tight">워크스페이스 현황</h2>
              </div>
              {allZero ? (
                <EmptyState
                  icon={<BarChart3 className="size-7" />}
                  message="아직 표시할 데이터가 없어요"
                  subtitle="학생과 수업을 등록하면 현황이 여기에 표시됩니다."
                />
              ) : (
                <WorkspaceOverviewChart data={chartData} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {isStudent && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                description: "과제 제출 현황 확인",
                tone: "assignments",
              },
              {
                href: "/my/retakes",
                icon: ClipboardList,
                label: "재시험 현황",
                description: "재시험 현황 확인",
                tone: "retakes",
              },
              {
                href: "/my/clinics",
                icon: Stethoscope,
                label: "클리닉",
                description: "클리닉 출석 현황",
                tone: "clinics",
              },
              { href: "/calendar", icon: Calendar, label: "캘린더", description: "일정 확인", tone: "calendar" },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group hover:-translate-y-0.5 flex flex-col gap-3 rounded-2xl border border-transparent bg-card p-5 shadow-sm transition-[box-shadow,transform] duration-[--motion-base] ease-[--ease-out-soft] hover:shadow-md">
              <IconBadge icon={item.icon} tone={item.tone} />
              <div className="flex flex-col gap-0.5">
                <div className="font-semibold text-base text-foreground">{item.label}</div>
                <div className="text-muted-foreground text-sm">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
