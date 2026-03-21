"use client";

import { createTypeStream } from "hangul-typing-animation";
import { BookOpen, Calendar, ClipboardList, Sparkles, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/shared/components/common/Container";
import { Badge } from "@/shared/components/ui/badge";
import { useUser } from "@/shared/hooks/useUser";
import { getGreetingByTime } from "@/shared/lib/utils/date";
import { useHomeStats } from "./(hooks)/useHomeStats";
import { useMyClinicAttendance } from "./(hooks)/useMyClinicAttendance";

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
  const { records: clinicRecords, isLoading: clinicLoading } = useMyClinicAttendance(isStudent && !!user);

  const isLoading = userLoading || (!isStudent && statsLoading);
  const greeting = getGreetingByTime();
  const typedGreeting = useHangulTyping(isLoading ? "" : greeting);

  if (isLoading) {
    return (
      <Container>
        <div className="flex animate-pulse flex-col gap-spacing-400 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-600 md:p-spacing-800">
          <div className="h-16 w-80 rounded-radius-300 bg-components-fill-standard-secondary" />
          <div className="h-[38px] w-40 rounded-full bg-components-fill-standard-secondary" />
        </div>
        <div className="grid grid-cols-1 gap-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
              <div className="flex flex-col gap-spacing-400">
                <div className="size-8 rounded-radius-200 bg-components-fill-standard-secondary" />
                <div className="flex flex-col gap-spacing-100">
                  <div className="h-16 w-12 rounded-radius-200 bg-components-fill-standard-secondary" />
                  <div>
                    <div className="h-[22px] w-14 rounded-radius-200 bg-components-fill-standard-secondary" />
                    <div className="h-5 w-24 rounded-radius-200 bg-components-fill-standard-secondary" />
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
  ];

  return (
    <Container>
      <div className="rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-600 md:p-spacing-800">
        <div className="flex flex-col gap-spacing-400">
          <h1 className="font-bold text-content-standard-primary text-display">
            안녕하세요,
            <br className="md:hidden" /> <span className="text-core-accent">{user?.name}</span>님
          </h1>
          <div className="flex w-fit items-center gap-spacing-200 rounded-full border border-core-accent/20 bg-core-accent-translucent px-spacing-400 py-spacing-200">
            <Sparkles className="size-4 shrink-0 text-core-accent" />
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
              className="group hover:-translate-y-spacing-50 relative flex flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-500 transition-all duration-300 hover:border-core-accent/30">
              <div className="flex flex-col gap-spacing-400">
                <item.icon className="size-8 text-core-accent transition-transform duration-300 group-hover:scale-110" />
                <div className="relative flex flex-col gap-spacing-100">
                  <div className="font-bold text-content-standard-primary text-display">{item.value}</div>
                  <div>
                    <div className="font-medium text-content-standard-primary text-label">{item.label}</div>
                    <div className="text-content-standard-tertiary text-footnote">{item.description}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isStudent && (
        <>
          <div className="grid grid-cols-1 gap-spacing-400 sm:grid-cols-3">
            {[
              { href: "/my/courses", icon: BookOpen, label: "시험/과제", description: "시험 및 과제 현황" },
              { href: "/my/retakes", icon: ClipboardList, label: "재시험", description: "재시험 현황" },
              { href: "/calendar", icon: Calendar, label: "캘린더", description: "일정 확인" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group hover:-translate-y-spacing-50 relative flex flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-500 transition-all duration-300 hover:border-core-accent/30">
                <div className="flex flex-col gap-spacing-400">
                  <item.icon className="size-8 text-core-accent transition-transform duration-300 group-hover:scale-110" />
                  <div className="relative flex flex-col gap-spacing-100">
                    <div className="font-medium text-content-standard-primary text-label">{item.label}</div>
                    <div className="text-content-standard-tertiary text-footnote">{item.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-spacing-400 rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
            <div className="flex items-center gap-spacing-200">
              <Stethoscope className="size-5 text-core-accent" />
              <h2 className="font-semibold text-body text-content-standard-primary">최근 클리닉 출석</h2>
            </div>
            {clinicLoading ? (
              <div className="flex flex-col gap-spacing-300">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-radius-300 bg-components-fill-standard-secondary"
                  />
                ))}
              </div>
            ) : clinicRecords.length === 0 ? (
              <div className="py-spacing-400 text-center text-content-standard-tertiary text-footnote">
                클리닉 출석 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider rounded-radius-400 border border-line-outline">
                {clinicRecords.slice(0, 10).map((record) => {
                  const date = new Date(`${record.attendanceDate}T00:00:00`);
                  const dateStr = date.toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  });

                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between gap-spacing-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                      <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                        <span className="truncate font-medium text-body text-content-standard-primary">
                          {record.clinic.name}
                        </span>
                        <span className="text-content-standard-tertiary text-footnote">{dateStr}</span>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-spacing-100">
                        {record.isRequired ? (
                          <Badge variant="blue" size="xs">
                            필참
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="xs">
                            자율
                          </Badge>
                        )}
                        {record.didRetakeExam && (
                          <Badge variant="purple" size="xs">
                            재시험
                          </Badge>
                        )}
                        {record.didHomeworkCheck && (
                          <Badge variant="green" size="xs">
                            숙제검사
                          </Badge>
                        )}
                        {record.didQa && (
                          <Badge variant="orange" size="xs">
                            질의응답
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </Container>
  );
}
