"use client";

import { BookOpen, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { useUser } from "@/shared/hooks/useUser";
import { useHomeStats } from "./(hooks)/useHomeStats";

export default function Home() {
  const { user, isLoading: userLoading, isStudent } = useUser();
  const { stats, isLoading: statsLoading } = useHomeStats(!isStudent && !!user);

  const isLoading = userLoading || (!isStudent && statsLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingComponent />
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
        <p className="text-body text-content-standard-secondary">티노트에 오신 것을 환영합니다</p>

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
