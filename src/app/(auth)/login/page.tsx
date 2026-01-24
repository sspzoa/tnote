"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormSelect } from "@/shared/components/ui/formSelect";
import { Modal } from "@/shared/components/ui/modal";
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
    } catch {
      // noop
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
    } catch {
      alert("로그인에 실패했습니다.");
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
    } catch {
      alert("회원가입에 실패했습니다.");
    } finally {
      setRegistering(false);
    }
  };

  const workspaceOptions = [
    { value: "", label: "워크스페이스를 선택하세요" },
    ...workspaces.map((w) => ({ value: w.id, label: w.name })),
  ];

  return (
    <div className="flex h-dvh items-center justify-center p-spacing-400 md:p-spacing-600">
      <div className="w-full max-w-md">
        <div className="mb-spacing-600 text-center">
          <h1 className="font-bold text-content-standard-primary text-title">Tnote</h1>
          <p className="mt-spacing-200 text-body text-content-standard-secondary">선생님을 위한 학생관리 서비스</p>
        </div>
        <div className="rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600 md:p-spacing-800">
          <div className="relative mb-spacing-600 flex gap-spacing-100 rounded-radius-400 bg-components-fill-standard-secondary p-spacing-100">
            <div
              className={`absolute top-spacing-100 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-radius-300 bg-core-accent transition-all duration-200 ${
                tab === "student" ? "left-[calc(50%+2px)]" : "left-spacing-100"
              }`}
            />
            <button
              onClick={() => {
                setTab("teacher");
                setWorkspaceId("");
              }}
              className={`relative z-10 flex-1 rounded-radius-300 py-spacing-400 font-semibold text-body transition-colors duration-200 ${
                tab === "teacher"
                  ? "text-solid-white"
                  : "text-content-standard-secondary hover:text-content-standard-primary"
              }`}>
              선생님 로그인
            </button>
            <button
              onClick={() => {
                setTab("student");
              }}
              className={`relative z-10 flex-1 rounded-radius-300 py-spacing-400 font-semibold text-body transition-colors duration-200 ${
                tab === "student"
                  ? "text-solid-white"
                  : "text-content-standard-secondary hover:text-content-standard-primary"
              }`}>
              학생 로그인
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-spacing-500">
            {tab === "student" && (
              <FormSelect
                label="워크스페이스"
                required
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                options={workspaceOptions}
                disabled={loading}
              />
            )}

            <FormInput
              label="전화번호"
              required
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01012345678"
              disabled={loading}
            />

            <FormInput
              label="비밀번호"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
            />

            <Button type="submit" disabled={loading} isLoading={loading} loadingText="로그인 중..." className="w-full">
              로그인
            </Button>

            {/* {tab === "teacher" && (
              <div className="text-center text-body text-content-standard-secondary">
                계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="font-medium text-core-accent transition-all duration-150 hover:brightness-110">
                  회원가입
                </button>
              </div>
            )} */}
          </form>
        </div>
      </div>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="선생님 회원가입"
        subtitle="계정과 함께 새로운 워크스페이스가 만들어집니다."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowRegisterModal(false)} className="flex-1">
              취소
            </Button>
            <Button
              type="submit"
              form="register-form"
              disabled={registering}
              isLoading={registering}
              loadingText="가입 중..."
              className="flex-1">
              회원가입
            </Button>
          </>
        }>
        <form id="register-form" onSubmit={handleRegister} className="space-y-spacing-400">
          <FormInput
            label="이름"
            required
            type="text"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
          />

          <FormInput
            label="워크스페이스 이름"
            required
            type="text"
            value={registerForm.workspaceName}
            onChange={(e) => setRegisterForm({ ...registerForm, workspaceName: e.target.value })}
            placeholder="ex. 러셀부천 김희창T"
          />

          <FormInput
            label="전화번호"
            required
            type="tel"
            value={registerForm.phoneNumber}
            onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
            placeholder="01012345678"
          />

          <FormInput
            label="비밀번호"
            required
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            placeholder="8자 이상"
          />

          <FormInput
            label="비밀번호 확인"
            required
            type="password"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            placeholder="비밀번호를 다시 입력하세요"
          />
        </form>
      </Modal>
    </div>
  );
}
