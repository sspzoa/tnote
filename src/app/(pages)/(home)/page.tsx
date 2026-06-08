"use client";

import { createTypeStream } from "hangul-typing-animation";
import { BookOpen, Calendar, ClipboardList, FileCheck, Sparkles, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/shared/components/common/Container";
import { useUser } from "@/shared/hooks/useUser";
import { getGreetingByTime } from "@/shared/lib/utils/date";
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
        <div className="flex animate-pulse flex-col gap-4 rounded-xl border border-border bg-card p-7 md:p-10">
          <div className="h-16 w-80 rounded-md bg-muted" />
          <div className="h-[38px] w-40 rounded-full bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4">
                <div className="size-8 rounded-sm bg-muted" />
                <div className="flex flex-col gap-1">
                  <div className="h-16 w-12 rounded-sm bg-muted" />
                  <div>
                    <div className="h-[22px] w-14 rounded-sm bg-muted" />
                    <div className="h-5 w-24 rounded-sm bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  const statItems = [
    {
      href: "/courses",
      icon: BookOpen,
      value: stats?.courseCount || 0,
      label: "수업",
      description: "진행 중인 수업",
    },
    {
      href: "/students",
      icon: Users,
      value: stats?.studentCount || 0,
      label: "학생",
      description: "등록된 학생 수",
    },
    {
      href: "/retakes",
      icon: ClipboardList,
      value: stats?.pendingRetakeCount || 0,
      label: "재시험",
      description: "대기 중인 재시험",
    },
    {
      href: "/assignments",
      icon: FileCheck,
      value: stats?.pendingAssignmentTaskCount || 0,
      label: "과제",
      description: "대기 중인 과제",
    },
    {
      href: "/clinics",
      icon: Stethoscope,
      value: stats?.activeClinicCount || 0,
      label: "클리닉",
      description: "운영 중인 클리닉",
    },
  ];

  return (
    <Container>
      <div className="rounded-xl border border-border bg-card p-7 md:p-10">
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-5xl text-foreground">
            안녕하세요,
            <br className="md:hidden" /> <span className="text-primary">{user?.name}</span>님
          </h1>
          <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <p className="text-primary text-sm">{typedGreeting || "\u00A0"}</p>
          </div>
        </div>
      </div>

      {!isStudent && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group hover:-translate-y-0.5 relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30">
              <div className="flex flex-col gap-4">
                <item.icon className="size-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="relative flex flex-col gap-1">
                  <div className="font-bold text-5xl text-foreground">{item.value}</div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{item.label}</div>
                    <div className="text-muted-foreground text-xs">{item.description}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isStudent && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/my/courses", icon: BookOpen, label: "시험 현황", description: "시험 성적 확인" },
            { href: "/my/assignments", icon: FileCheck, label: "과제 현황", description: "과제 제출 현황 확인" },
            { href: "/my/retakes", icon: ClipboardList, label: "재시험 현황", description: "재시험 현황 확인" },
            { href: "/my/clinics", icon: Stethoscope, label: "클리닉", description: "클리닉 출석 현황" },
            { href: "/calendar", icon: Calendar, label: "캘린더", description: "일정 확인" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group hover:-translate-y-0.5 relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30">
              <div className="flex flex-col gap-4">
                <item.icon className="size-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="relative flex flex-col gap-1">
                  <div className="font-medium text-foreground text-sm">{item.label}</div>
                  <div className="text-muted-foreground text-xs">{item.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
