"use client";

import { createTypeStream } from "hangul-typing-animation";
import { BookOpen, ClipboardList, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/shared/components/ui";
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
      <div className="flex min-h-screen items-center justify-center p-spacing-600">
        <div className="w-full max-w-2xl text-center">
          <Skeleton className="mx-auto mb-spacing-200 h-16 w-64" />
          <Skeleton className="mx-auto mt-spacing-300 h-12 w-48 rounded-full" />
          <div className="mt-spacing-800 grid grid-cols-3 gap-spacing-400">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-spacing-300 rounded-radius-500 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-16 w-12" />
                <Skeleton className="h-6 w-16" />
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
      bgColor: "bg-solid-translucent-blue",
      iconColor: "text-solid-blue",
      hoverBorder: "hover:border-solid-blue",
      gradientFrom: "group-hover:from-solid-translucent-blue/30",
    },
    {
      href: "/students",
      icon: Users,
      value: stats?.studentCount || 0,
      label: "학생",
      bgColor: "bg-solid-translucent-green",
      iconColor: "text-solid-green",
      hoverBorder: "hover:border-solid-green",
      gradientFrom: "group-hover:from-solid-translucent-green/30",
    },
    {
      href: "/retakes",
      icon: ClipboardList,
      value: stats?.pendingRetakeCount || 0,
      label: "남은 재시험",
      bgColor: "bg-solid-translucent-yellow",
      iconColor: "text-solid-yellow",
      hoverBorder: "hover:border-solid-yellow",
      gradientFrom: "group-hover:from-solid-translucent-yellow/30",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-spacing-600">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-display">
          안녕하세요, {user?.name}님
        </h1>
        <div className="mt-spacing-300 inline-flex items-center gap-spacing-200 rounded-full bg-core-accent-translucent py-spacing-300 pr-spacing-500 pl-spacing-400">
          <Sparkles className="size-4 text-core-accent" />
          <p className="text-body text-content-standard-secondary">{typedGreeting || "\u00A0"}</p>
        </div>

        {!isStudent && stats && (
          <div className="mt-spacing-800 grid grid-cols-3 gap-spacing-400">
            {statItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col items-center gap-spacing-300 overflow-hidden rounded-radius-500 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all duration-200 ${item.hoverBorder}`}>
                <div
                  className={`absolute inset-0 bg-gradient-to-b from-transparent to-transparent transition-all duration-200 ${item.gradientFrom} group-hover:to-transparent`}
                />
                <div
                  className={`relative flex size-16 items-center justify-center rounded-full ${item.bgColor} transition-all duration-200 group-hover:scale-110`}>
                  <item.icon className={`size-8 ${item.iconColor}`} />
                </div>
                <div className="relative font-bold text-content-standard-primary text-display">{item.value}</div>
                <div className="relative text-body text-content-standard-secondary">{item.label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
