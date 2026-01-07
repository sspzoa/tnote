"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body text-content-standard-tertiary">로딩중...</div>
      </div>
    );
  }

  // 학생용 화면
  if (userRole === "student") {
    return (
      <div className="min-h-screen p-spacing-600 md:p-spacing-800">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 */}
          <div className="mb-spacing-800">
            <div className="flex justify-between items-start mb-spacing-200">
              <h1 className="text-display font-bold text-content-standard-primary">내 재시험 일정</h1>
              {userName && (
                <div className="flex items-center gap-spacing-300">
                  <span className="text-body text-content-standard-primary font-medium">{userName}</span>
                  <button
                    onClick={handleLogout}
                    className="px-spacing-400 py-spacing-200 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-medium hover:bg-components-interactive-hover transition-colors border border-line-outline">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            <p className="text-body text-content-standard-secondary">나에게 할당된 재시험 목록입니다</p>
          </div>

          {/* 재시험 목록 */}
          {retakes.length === 0 ? (
            <div className="text-center py-spacing-900">
              <p className="text-body text-content-standard-tertiary">할당된 재시험이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-spacing-400">
              {retakes.map((retake) => (
                <div
                  key={retake.id}
                  className="bg-components-fill-standard-primary border border-line-outline rounded-radius-400 p-spacing-600">
                  <div className="flex justify-between items-start mb-spacing-400">
                    <div>
                      <h3 className="text-heading font-bold text-content-standard-primary mb-spacing-100">
                        {retake.exam.course.name} - {retake.exam.name}
                      </h3>
                      <p className="text-body text-content-standard-secondary">{retake.exam.exam_number}회차</p>
                    </div>
                    <span
                      className={`px-spacing-400 py-spacing-150 rounded-radius-200 text-footnote font-semibold ${
                        retake.status === "completed"
                          ? "bg-solid-translucent-green text-solid-green"
                          : retake.status === "rescheduled"
                            ? "bg-solid-translucent-orange text-solid-orange"
                            : "bg-solid-translucent-blue text-solid-blue"
                      }`}>
                      {retake.status === "completed"
                        ? "완료"
                        : retake.status === "rescheduled"
                          ? "일정변경"
                          : "예정"}
                    </span>
                  </div>
                  <div className="flex items-center gap-spacing-200 text-body text-content-standard-secondary">
                    <span>📅</span>
                    <span>{new Date(retake.current_scheduled_date).toLocaleDateString("ko-KR")}</span>
                  </div>
                  {retake.note && (
                    <div className="mt-spacing-400 p-spacing-400 bg-components-fill-standard-secondary rounded-radius-300">
                      <p className="text-label text-content-standard-secondary">{retake.note}</p>
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
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-spacing-800">
          <div className="flex justify-between items-start mb-spacing-200">
            <h1 className="text-display font-bold text-content-standard-primary">티노트</h1>
            {userName && (
              <div className="flex items-center gap-spacing-300">
                <span className="text-body text-content-standard-primary font-medium">{userName}</span>
                <button
                  onClick={handleLogout}
                  className="px-spacing-400 py-spacing-200 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-medium hover:bg-components-interactive-hover transition-colors border border-line-outline">
                  로그아웃
                </button>
              </div>
            )}
          </div>
          <p className="text-body text-content-standard-secondary">교사를 위한 학생 관리 서비스</p>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-500">
          <Link
            href="/retakes"
            className="bg-components-fill-standard-primary border border-line-outline rounded-radius-400 p-spacing-600 hover:border-core-accent hover:shadow-lg transition-all group">
            <div className="flex items-center gap-spacing-300 mb-spacing-500">
              <div className="w-12 h-12 bg-core-accent-translucent rounded-radius-400 flex items-center justify-center flex-shrink-0">
                <span className="text-heading text-core-accent">📝</span>
              </div>
              <h2 className="text-heading font-bold text-content-standard-primary group-hover:text-core-accent transition-colors">
                재시험 관리
              </h2>
            </div>
            <p className="text-body text-content-standard-secondary mb-spacing-400">학생들의 재시험을 할당하고 관리합니다</p>
            <div className="text-label text-core-accent font-semibold">바로가기 →</div>
          </Link>

          <Link
            href="/students"
            className="bg-components-fill-standard-primary border border-line-outline rounded-radius-400 p-spacing-600 hover:border-core-accent hover:shadow-lg transition-all group">
            <div className="flex items-center gap-spacing-300 mb-spacing-500">
              <div className="w-12 h-12 bg-solid-translucent-green rounded-radius-400 flex items-center justify-center flex-shrink-0">
                <span className="text-heading text-solid-green">👥</span>
              </div>
              <h2 className="text-heading font-bold text-content-standard-primary group-hover:text-core-accent transition-colors">
                학생 관리
              </h2>
            </div>
            <p className="text-body text-content-standard-secondary mb-spacing-400">학생 정보를 관리합니다</p>
            <div className="text-label text-core-accent font-semibold">바로가기 →</div>
          </Link>

          <Link
            href="/courses"
            className="bg-components-fill-standard-primary border border-line-outline rounded-radius-400 p-spacing-600 hover:border-core-accent hover:shadow-lg transition-all group">
            <div className="flex items-center gap-spacing-300 mb-spacing-500">
              <div className="w-12 h-12 bg-solid-translucent-purple rounded-radius-400 flex items-center justify-center flex-shrink-0">
                <span className="text-heading text-solid-purple">📚</span>
              </div>
              <h2 className="text-heading font-bold text-content-standard-primary group-hover:text-core-accent transition-colors">
                수업 관리
              </h2>
            </div>
            <p className="text-body text-content-standard-secondary mb-spacing-400">수업과 코스를 관리합니다</p>
            <div className="text-label text-core-accent font-semibold">바로가기 →</div>
          </Link>

          {userRole === "owner" && (
            <Link
              href="/admins"
              className="bg-components-fill-standard-primary border border-line-outline rounded-radius-400 p-spacing-600 hover:border-core-accent hover:shadow-lg transition-all group">
              <div className="flex items-center gap-spacing-300 mb-spacing-500">
                <div className="w-12 h-12 bg-solid-translucent-blue rounded-radius-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-heading text-solid-blue">👨‍💼</span>
                </div>
                <h2 className="text-heading font-bold text-content-standard-primary group-hover:text-core-accent transition-colors">
                  관리자 관리
                </h2>
              </div>
              <p className="text-body text-content-standard-secondary mb-spacing-400">워크스페이스 관리자를 관리합니다</p>
              <div className="text-label text-core-accent font-semibold">바로가기 →</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
