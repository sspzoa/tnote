"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Retake {
  id: string;
  current_scheduled_date: string;
  status: string;
  note: string | null;
  exam: {
    id: string;
    name: string;
    exam_number: number;
    course: {
      id: string;
      name: string;
    };
  };
}

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [retakes, setRetakes] = useState<Retake[]>([]);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userRole === "student" && userId) {
      fetchMyRetakes();
    }
  }, [userRole, userId]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const result = await response.json();
      if (result.user) {
        setUserName(result.user.name);
        setUserId(result.user.id);
        setUserRole(result.user.role);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRetakes = async () => {
    try {
      const response = await fetch(`/api/retakes?studentId=${userId}`);
      const result = await response.json();
      if (response.ok) {
        setRetakes(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch retakes:", error);
    }
  };

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
      } else {
        alert("로그아웃에 실패했습니다.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-body text-content-standard-tertiary">로딩중...</div>
      </div>
    );
  }

  // 학생용 화면
  if (userRole === "student") {
    return (
      <div className="min-h-screen p-spacing-600 md:p-spacing-800">
        <div className="mx-auto max-w-5xl">
          {/* 헤더 */}
          <div className="mb-spacing-800">
            <div className="mb-spacing-200 flex items-start justify-between">
              <h1 className="font-bold text-content-standard-primary text-display">내 재시험 일정</h1>
              {userName && (
                <div className="flex items-center gap-spacing-300">
                  <span className="font-medium text-body text-content-standard-primary">{userName}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            <p className="text-body text-content-standard-secondary">나에게 할당된 재시험 목록입니다</p>
          </div>

          {/* 재시험 목록 */}
          {retakes.length === 0 ? (
            <div className="py-spacing-900 text-center">
              <p className="text-body text-content-standard-tertiary">할당된 재시험이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-spacing-400">
              {retakes.map((retake) => (
                <div
                  key={retake.id}
                  className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
                  <div className="mb-spacing-400 flex items-start justify-between">
                    <div>
                      <h3 className="mb-spacing-100 font-bold text-content-standard-primary text-heading">
                        {retake.exam.course.name} - {retake.exam.name}
                      </h3>
                      <p className="text-body text-content-standard-secondary">{retake.exam.exam_number}회차</p>
                    </div>
                    <span
                      className={`rounded-radius-200 px-spacing-400 py-spacing-150 font-semibold text-footnote ${
                        retake.status === "completed"
                          ? "bg-solid-translucent-green text-solid-green"
                          : retake.status === "rescheduled"
                            ? "bg-solid-translucent-orange text-solid-orange"
                            : "bg-solid-translucent-blue text-solid-blue"
                      }`}>
                      {retake.status === "completed" ? "완료" : retake.status === "rescheduled" ? "일정변경" : "예정"}
                    </span>
                  </div>
                  <div className="flex items-center gap-spacing-200 text-body text-content-standard-secondary">
                    <span>📅</span>
                    <span>{new Date(retake.current_scheduled_date).toLocaleDateString("ko-KR")}</span>
                  </div>
                  {retake.note && (
                    <div className="mt-spacing-400 rounded-radius-300 bg-components-fill-standard-secondary p-spacing-400">
                      <p className="text-content-standard-secondary text-label">{retake.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 관리자/오너용 화면
  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-800">
          <div className="mb-spacing-200 flex items-start justify-between">
            <h1 className="font-bold text-content-standard-primary text-display">티노트</h1>
            {userName && (
              <div className="flex items-center gap-spacing-300">
                <span className="font-medium text-body text-content-standard-primary">{userName}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  로그아웃
                </button>
              </div>
            )}
          </div>
          <p className="text-body text-content-standard-secondary">교사를 위한 학생 관리 서비스</p>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 gap-spacing-500 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/retakes"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-core-accent-translucent">
                <span className="text-core-accent text-heading">📝</span>
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                재시험 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">
              학생들의 재시험을 할당하고 관리합니다
            </p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          <Link
            href="/students"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-green">
                <span className="text-heading text-solid-green">👥</span>
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                학생 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">학생 정보를 관리합니다</p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          <Link
            href="/courses"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-purple">
                <span className="text-heading text-solid-purple">📚</span>
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                수업 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">수업과 코스를 관리합니다</p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          {userRole === "owner" && (
            <Link
              href="/admins"
              className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
              <div className="mb-spacing-500 flex items-center gap-spacing-300">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-blue">
                  <span className="text-heading text-solid-blue">👨‍💼</span>
                </div>
                <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                  관리자 관리
                </h2>
              </div>
              <p className="mb-spacing-400 text-body text-content-standard-secondary">
                워크스페이스 관리자를 관리합니다
              </p>
              <div className="font-semibold text-core-accent text-label">바로가기 →</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
