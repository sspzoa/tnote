"use client";

import { createTypeStream } from "hangul-typing-animation";
import { BookOpen, ClipboardList, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
      <div className="min-h-screen p-spacing-500 md:p-spacing-700">
        <div className="mx-auto max-w-6xl space-y-spacing-700">
          <div className="animate-pulse rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-600 md:p-spacing-800">
            <div className="mb-spacing-400 h-16 w-80 rounded-radius-300 bg-components-fill-standard-secondary" />
            <div className="h-[38px] w-40 rounded-full bg-components-fill-standard-secondary" />
          </div>
          <div className="grid grid-cols-1 gap-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
                <div className="size-8 rounded-radius-200 bg-components-fill-standard-secondary" />
                <div className="mt-spacing-400">
                  <div className="h-16 w-12 rounded-radius-200 bg-components-fill-standard-secondary" />
                  <div className="mt-spacing-100 h-[22px] w-14 rounded-radius-200 bg-components-fill-standard-secondary" />
                  <div className="mt-spacing-50 h-5 w-24 rounded-radius-200 bg-components-fill-standard-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  ];

  return (
    <div className="min-h-screen p-spacing-500 md:p-spacing-700">
      <div className="mx-auto max-w-6xl space-y-spacing-700">
        <div className="relative overflow-hidden rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-600 md:p-spacing-800">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-core-accent-translucent opacity-50 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-48 rounded-full bg-solid-translucent-purple opacity-30 blur-3xl" />

          <div className="relative">
            <h1 className="mb-spacing-400 font-bold text-content-standard-primary text-display">
              안녕하세요,
              <br className="md:hidden" /> <span className="text-core-accent">{user?.name}</span>님
            </h1>
            <div className="inline-flex items-center gap-spacing-200 rounded-full border border-core-accent/20 bg-core-accent-translucent px-spacing-400 py-spacing-200">
              <Sparkles className="size-4 text-core-accent" />
              <p className="text-core-accent text-label">{typedGreeting || "\u00A0"}</p>
            </div>
          </div>
        </div>

        {!isStudent && stats && (
          <div className="grid grid-cols-1 gap-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
            {statItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-500 transition-all duration-300 hover:-translate-y-spacing-50 hover:border-core-accent/30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-core-accent-translucent/0 transition-all duration-300 group-hover:to-core-accent-translucent/30" />

                <item.icon className="size-8 text-core-accent transition-transform duration-300 group-hover:scale-110" />

                <div className="relative mt-spacing-400">
                  <div className="font-bold text-content-standard-primary text-display">{item.value}</div>
                  <div className="mt-spacing-100 font-medium text-content-standard-primary text-label">
                    {item.label}
                  </div>
                  <div className="text-content-standard-tertiary text-footnote">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {isStudent && (
          <div className="rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600 text-center">
            <div className="mx-auto mb-spacing-400 flex size-16 items-center justify-center rounded-full bg-core-accent-translucent">
              <BookOpen className="size-8 text-core-accent" />
            </div>
            <h2 className="mb-spacing-200 font-semibold text-content-standard-primary text-heading">
              학습을 시작하세요
            </h2>
            <p className="text-content-standard-secondary text-body">사이드바 메뉴에서 원하는 기능을 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
