"use client";

import { BookOpen, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  courseCount: number;
  studentCount: number;
  pendingRetakeCount: number;
}

export default function Home() {
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    fetchStats();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const result = await response.json();
      if (result.user) {
        setUserName(result.user.name);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [coursesRes, studentsRes, retakesRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/students"),
        fetch("/api/retakes?status=pending"),
      ]);

      const [coursesData, studentsData, retakesData] = await Promise.all([
        coursesRes.json(),
        studentsRes.json(),
        retakesRes.json(),
      ]);

      setStats({
        courseCount: coursesData.data?.length || 0,
        studentCount: studentsData.data?.length || 0,
        pendingRetakeCount: retakesData.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-body text-content-standard-tertiary">로딩중...</div>
      </div>
    );
  }

  const statItems = [
    {
      href: "/courses",
      icon: BookOpen,
      value: stats?.courseCount || 0,
      label: "수업",
      bgColor: "bg-solid-translucent-purple",
      iconColor: "text-solid-purple",
    },
    {
      href: "/students",
      icon: Users,
      value: stats?.studentCount || 0,
      label: "학생",
      bgColor: "bg-solid-translucent-green",
      iconColor: "text-solid-green",
    },
    {
      href: "/retakes",
      icon: ClipboardList,
      value: stats?.pendingRetakeCount || 0,
      label: "남은 재시험",
      bgColor: "bg-core-accent-translucent",
      iconColor: "text-core-accent",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-spacing-600">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-display">
          안녕하세요, {userName}님
        </h1>
        <p className="mb-spacing-800 text-body text-content-standard-secondary">티노트에 오신 것을 환영합니다</p>

        {stats && (
          <div className="grid grid-cols-3 gap-spacing-400">
            {statItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center gap-spacing-300 rounded-radius-500 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
                <div
                  className={`flex size-16 items-center justify-center rounded-full ${item.bgColor} transition-transform group-hover:scale-110`}>
                  <item.icon className={`size-8 ${item.iconColor}`} />
                </div>
                <div className="font-bold text-content-standard-primary text-display">{item.value}</div>
                <div className="text-body text-content-standard-secondary">{item.label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
