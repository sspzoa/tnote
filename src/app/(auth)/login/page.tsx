"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

interface Workspace {
  id: string;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"teacher" | "student">("teacher");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    workspaceName: "",
  });
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (tab === "student") {
      fetchWorkspaces();
    }
  }, [tab]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      const result = await response.json();
      setWorkspaces(result.data || []);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: removePhoneHyphens(phoneNumber),
          password,
          workspaceId: tab === "student" ? workspaceId : undefined,
          isTeacher: tab === "teacher",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      alert("로그인에 실패했습니다.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (registerForm.password.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerForm.name,
          phoneNumber: removePhoneHyphens(registerForm.phoneNumber),
          password: registerForm.password,
          workspaceName: registerForm.workspaceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "회원가입에 실패했습니다.");
        return;
      }

      alert(data.message || "회원가입이 완료되었습니다.");
      setShowRegisterModal(false);
      setRegisterForm({ name: "", phoneNumber: "", password: "", confirmPassword: "", workspaceName: "" });
    } catch (err) {
      alert("회원가입에 실패했습니다.");
      console.error("Registration error:", err);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="flex h-dvh items-center justify-center p-spacing-400 md:p-spacing-600">
      <div className="w-full max-w-md">
        <div className="mb-spacing-600 text-center">
          <h1 className="font-bold text-content-standard-primary text-title">Tnote</h1>
          <p className="mt-spacing-200 text-body text-content-standard-secondary">선생님을 위한 학생관리 서비스</p>
        </div>
        <div className="rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600 md:p-spacing-800">
          {/* 탭 */}
          <div className="mb-spacing-600 flex gap-spacing-300">
            <button
              onClick={() => {
                setTab("teacher");
                setWorkspaceId("");
              }}
              className={`flex-1 rounded-radius-400 py-spacing-400 font-semibold text-body transition-all ${
                tab === "teacher"
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              선생님 로그인
            </button>
            <button
              onClick={() => {
                setTab("student");
              }}
              className={`flex-1 rounded-radius-400 py-spacing-400 font-semibold text-body transition-all ${
                tab === "student"
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              학생 로그인
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-spacing-600">
            {tab === "student" && (
              <div>
                <label
                  htmlFor="workspace"
                  className="mb-spacing-300 block font-semibold text-body text-content-standard-primary">
                  워크스페이스
                </label>
                <select
                  id="workspace"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  required
                  className="w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent disabled:opacity-50"
                  disabled={loading}>
                  <option value="">워크스페이스를 선택하세요</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-spacing-300 block font-semibold text-body text-content-standard-primary">
                전화번호
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01012345678"
                required
                className="w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-spacing-300 block font-semibold text-body text-content-standard-primary">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-radius-400 bg-core-accent py-spacing-500 font-bold text-body text-solid-white transition-all hover:opacity-90 disabled:opacity-50">
              {loading ? "로그인 중..." : "로그인"}
            </button>

            {tab === "teacher" && (
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="w-full rounded-radius-400 bg-transparent py-spacing-500 font-bold text-body text-core-accent transition-all hover:bg-components-interactive-hover">
                회원가입
              </button>
            )}
          </form>
        </div>
      </div>

      {/* 회원가입 모달 */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
          onClick={() => setShowRegisterModal(false)}>
          <div
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
            onClick={(e) => e.stopPropagation()}>
            <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
              <h2 className="font-bold text-content-standard-primary text-heading">선생님 회원가입</h2>
              <p className="mt-spacing-100 text-content-standard-secondary text-label">
                계정과 함께 새로운 워크스페이스가 만들어집니다.
              </p>
            </div>

            <form onSubmit={handleRegister} className="flex-1 overflow-y-auto p-spacing-600">
              <div className="space-y-spacing-400">
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body focus:border-core-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    워크스페이스 이름 *
                  </label>
                  <input
                    type="text"
                    value={registerForm.workspaceName}
                    onChange={(e) => setRegisterForm({ ...registerForm, workspaceName: e.target.value })}
                    required
                    placeholder="ex. 러셀부천 김희창T"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body focus:border-core-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    required
                    placeholder="01012345678"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body focus:border-core-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    placeholder="최소 8자 이상"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body focus:border-core-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    비밀번호 확인 *
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body focus:border-core-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-spacing-600 flex gap-spacing-300">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white disabled:opacity-50">
                  {registering ? "가입 중..." : "회원가입"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
