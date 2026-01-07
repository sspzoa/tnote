"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [error, setError] = useState("");
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
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          password,
          workspaceId: tab === "student" ? workspaceId : undefined,
          isTeacher: tab === "teacher",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (registerForm.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
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
          phoneNumber: registerForm.phoneNumber,
          password: registerForm.password,
          workspaceName: registerForm.workspaceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      alert(data.message);
      setShowRegisterModal(false);
      setRegisterForm({ name: "", phoneNumber: "", password: "", confirmPassword: "", workspaceName: "" });
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
      console.error("Registration error:", err);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-spacing-600">
      <div className="w-full max-w-md">
        <div className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline p-spacing-800">
          {/* 헤더 */}
          <div className="text-center mb-spacing-800">
            <h1 className="text-title font-bold text-content-standard-primary mb-spacing-200">티노트</h1>
            <p className="text-body text-content-standard-secondary">학생 관리 서비스</p>
          </div>

          {/* 탭 */}
          <div className="flex gap-spacing-300 mb-spacing-600">
            <button
              onClick={() => {
                setTab("teacher");
                setError("");
                setWorkspaceId("");
              }}
              className={`flex-1 py-spacing-400 rounded-radius-400 text-body font-semibold transition-all ${
                tab === "teacher"
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              선생님 로그인
            </button>
            <button
              onClick={() => {
                setTab("student");
                setError("");
              }}
              className={`flex-1 py-spacing-400 rounded-radius-400 text-body font-semibold transition-all ${
                tab === "student"
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              학생 로그인
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-spacing-600">
            {/* 학생 로그인: 워크스페이스 선택 */}
            {tab === "student" && (
              <div>
                <label
                  htmlFor="workspace"
                  className="block text-body font-semibold text-content-standard-primary mb-spacing-300">
                  워크스페이스
                </label>
                <select
                  id="workspace"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  required
                  className="w-full px-spacing-500 py-spacing-400 bg-components-fill-standard-secondary border border-line-outline rounded-radius-400 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* 전화번호 입력 */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-body font-semibold text-content-standard-primary mb-spacing-300">
                전화번호
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01012345678"
                required
                className="w-full px-spacing-500 py-spacing-400 bg-components-fill-standard-secondary border border-line-outline rounded-radius-400 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-body font-semibold text-content-standard-primary mb-spacing-300">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full px-spacing-500 py-spacing-400 bg-components-fill-standard-secondary border border-line-outline rounded-radius-400 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-solid-translucent-red text-core-status-negative px-spacing-500 py-spacing-400 rounded-radius-400 text-body font-medium border border-core-status-negative/20">
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-core-accent text-solid-white py-spacing-500 rounded-radius-400 text-body font-bold hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? "로그인 중..." : "로그인"}
            </button>

            {/* 선생님 로그인: 회원가입 링크 */}
            {tab === "teacher" && (
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="w-full text-body text-core-accent hover:underline font-medium">
                계정이 없으신가요? 회원가입
              </button>
            )}
          </form>
        </div>

        {/* 푸터 */}
        <p className="text-center text-label text-content-standard-tertiary mt-spacing-600">
          © 2026 Tnote. 교사를 위한 학생 관리 서비스.
        </p>
      </div>

      {/* 회원가입 모달 */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 bg-solid-black/50 flex items-center justify-center p-spacing-400 z-50"
          onClick={() => setShowRegisterModal(false)}>
          <div
            className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline max-w-md w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <div className="px-spacing-600 py-spacing-500 border-b border-line-divider">
              <h2 className="text-heading font-bold text-content-standard-primary">선생님 회원가입</h2>
              <p className="text-label text-content-standard-secondary mt-spacing-100">
                계정과 함께 새로운 워크스페이스가 만들어집니다.
              </p>
            </div>

            {/* 모달 내용 */}
            <form onSubmit={handleRegister} className="flex-1 overflow-y-auto p-spacing-600">
              <div className="space-y-spacing-400">
                {/* 이름 */}
                <div>
                  <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                    이름 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                    className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                  />
                </div>

                {/* 워크스페이스 이름 */}
                <div>
                  <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                    워크스페이스 이름 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.workspaceName}
                    onChange={(e) => setRegisterForm({ ...registerForm, workspaceName: e.target.value })}
                    required
                    placeholder="예: 홍길동 학원"
                    className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                    전화번호 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    required
                    placeholder="01012345678"
                    className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                    비밀번호 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    placeholder="최소 8자 이상"
                    className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                  />
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                    비밀번호 확인 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                  />
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="bg-solid-translucent-red text-core-status-negative px-spacing-400 py-spacing-300 rounded-radius-300 text-label font-medium border border-core-status-negative/20">
                    {error}
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="flex gap-spacing-300 mt-spacing-600">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setError("");
                  }}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-core-accent text-solid-white rounded-radius-300 text-body font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
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
