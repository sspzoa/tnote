"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [retakes, setRetakes] = useState<Retake[]>([]);
  const [retakesLoading, setRetakesLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordChanging, setPasswordChanging] = useState(false);

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
        setWorkspaceName(result.user.workspaceName || "");
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRetakes = async () => {
    setRetakesLoading(true);
    try {
      const response = await fetch(`/api/retakes?studentId=${userId}`);
      const result = await response.json();
      if (response.ok) {
        setRetakes(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch retakes:", error);
    } finally {
      setRetakesLoading(false);
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

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setPasswordChanging(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("비밀번호가 변경되었습니다.");
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(result.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setPasswordChanging(false);
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
              <div className="flex items-center gap-spacing-400">
                <h1 className="font-bold text-content-standard-primary text-display">Tnote</h1>
                {workspaceName && (
                  <span className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-body text-content-standard-secondary">
                    {workspaceName}
                  </span>
                )}
              </div>
              {userName && (
                <div className="flex items-center gap-spacing-300">
                  <span className="font-medium text-body text-content-standard-primary">{userName}</span>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    비밀번호 변경
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            <p className="text-body text-content-standard-secondary">수업 관련 서비스를 한 곳에서 확인하세요</p>
          </div>

          {/* 재시험 목록 */}
          {retakesLoading ? (
            <div className="py-spacing-900 text-center">
              <p className="text-body text-content-standard-tertiary">로딩 중...</p>
            </div>
          ) : retakes.length === 0 ? (
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

        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-radius-500 bg-components-fill-standard-primary p-spacing-700">
              <h2 className="mb-spacing-600 font-bold text-content-standard-primary text-heading">비밀번호 변경</h2>

              <div className="space-y-spacing-500">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
                  />
                </div>

                <p className="text-content-standard-tertiary text-label">비밀번호는 8자 이상이어야 합니다.</p>
              </div>

              <div className="mt-spacing-600 flex justify-end gap-spacing-300">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={
                    passwordChanging ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                  className="rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-medium text-body text-white transition-colors hover:bg-core-accent-active disabled:opacity-50">
                  {passwordChanging ? "변경 중..." : "변경"}
                </button>
              </div>
            </div>
          </div>
        )}
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
            <div className="flex items-center gap-spacing-400">
              <h1 className="font-bold text-content-standard-primary text-display">Tnote</h1>
              {workspaceName && (
                <span className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-body text-content-standard-secondary">
                  {workspaceName}
                </span>
              )}
            </div>
            {userName && (
              <div className="flex items-center gap-spacing-300">
                <span className="font-medium text-body text-content-standard-primary">{userName}</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  비밀번호 변경
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  로그아웃
                </button>
              </div>
            )}
          </div>
          <p className="text-body text-content-standard-secondary">선생님을 위한 학생 관리 서비스</p>
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
            <p className="mb-spacing-400 text-body text-content-standard-secondary">수업을 관리합니다</p>
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

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-radius-500 bg-components-fill-standard-primary p-spacing-700">
            <h2 className="mb-spacing-600 font-bold text-content-standard-primary text-heading">비밀번호 변경</h2>

            <div className="space-y-spacing-500">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
                />
              </div>

              <p className="text-content-standard-tertiary text-label">비밀번호는 8자 이상이어야 합니다.</p>
            </div>

            <div className="mt-spacing-600 flex justify-end gap-spacing-300">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={
                  passwordChanging ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                className="rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-medium text-body text-white transition-colors hover:bg-core-accent-active disabled:opacity-50">
                {passwordChanging ? "변경 중..." : "변경"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
