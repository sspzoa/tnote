"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormSelect } from "@/shared/components/ui/formSelect";
import { Modal } from "@/shared/components/ui/modal";
import { SegmentedControl } from "@/shared/components/ui/segmentedControl";
import { useToast } from "@/shared/hooks/useToast";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

interface Workspace {
  id: string;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
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
  const [agreements, setAgreements] = useState({ terms: false, privacy: false });
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
        toast.error(data.error || "로그인에 실패했습니다.");
        return;
      }

      if (data.isDefaultPassword) {
        toast.info("보안을 위해 비밀번호를 변경해주세요.");
      }

      router.push("/");
      router.refresh();
    } catch {
      toast.error("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreements.terms || !agreements.privacy) {
      toast.error("이용약관과 개인정보처리방침에 동의해주세요.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (registerForm.password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
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
          agreedToTerms: agreements.terms,
          agreedToPrivacy: agreements.privacy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "회원가입에 실패했습니다.");
        return;
      }

      toast.success(data.message || "회원가입이 완료되었습니다.");
      setShowRegisterModal(false);
      setRegisterForm({ name: "", phoneNumber: "", password: "", confirmPassword: "", workspaceName: "" });
      setAgreements({ terms: false, privacy: false });
    } catch {
      toast.error("회원가입에 실패했습니다.");
    } finally {
      setRegistering(false);
    }
  };

  const workspaceOptions = [
    { value: "", label: "워크스페이스를 선택하세요" },
    ...workspaces.map((w) => ({ value: w.id, label: w.name })),
  ];

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-core-accent p-spacing-600 lg:min-h-dvh lg:w-1/2 lg:p-spacing-800">
        <div className="pointer-events-none absolute inset-0">
          <div className="-right-32 -top-32 absolute size-96 rounded-full bg-solid-white/10 blur-3xl" />
          <div className="-bottom-48 -left-48 absolute size-[500px] rounded-full bg-solid-indigo/20 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 size-64 rounded-full bg-solid-white/5 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-spacing-300">
            <div className="flex size-12 items-center justify-center rounded-radius-300 bg-solid-white/20 backdrop-blur-sm lg:size-14">
              <span className="font-bold text-solid-white text-xl lg:text-2xl">T</span>
            </div>
            <span className="font-bold text-solid-white text-xl lg:text-2xl">Tnote</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-spacing-400">
          <h1 className="font-bold text-3xl text-solid-white leading-tight lg:text-5xl">
            학생 관리,
            <br />더 스마트하게
          </h1>
          <p className="max-w-md text-body text-solid-white/80 lg:text-lg">
            출결, 성적, 상담까지. 선생님의 모든 학생 관리를 한 곳에서.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-background-standard-primary p-spacing-600 lg:p-spacing-800">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-spacing-800 flex flex-col gap-spacing-200">
            <h2 className="font-bold text-2xl text-content-standard-primary lg:text-3xl">로그인</h2>
            <p className="text-body text-content-standard-secondary">계정에 로그인하여 시작하세요</p>
          </div>

          <SegmentedControl
            items={[
              { value: "teacher", label: "선생님" },
              { value: "student", label: "학생" },
            ]}
            value={tab}
            onChange={(v) => {
              setTab(v);
              if (v === "teacher") setWorkspaceId("");
            }}
          />

          <form onSubmit={handleLogin} className="mt-spacing-600 flex flex-col gap-spacing-500">
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

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              loadingText="로그인 중..."
              className="mt-spacing-200 w-full">
              로그인
            </Button>

            {tab === "teacher" && (
              <div className="text-center text-body text-content-standard-secondary">
                계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="font-medium text-core-accent transition-all duration-150 hover:brightness-110">
                  회원가입
                </button>
              </div>
            )}
          </form>

          <p className="mt-spacing-800 text-center text-content-standard-tertiary text-footnote">
            © {new Date().getFullYear()} Tnote. All rights reserved.
          </p>
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
        <form id="register-form" onSubmit={handleRegister} className="flex flex-col gap-spacing-400">
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

          <div className="flex flex-col gap-spacing-300 border-line-divider border-t pt-spacing-400">
            <p className="font-semibold text-content-standard-primary text-label">
              약관 동의 <span className="text-core-status-negative">*</span>
            </p>
            <div className="flex flex-col gap-spacing-300">
              <label className="group flex cursor-pointer items-center gap-spacing-200">
                <input
                  type="checkbox"
                  checked={agreements.terms && agreements.privacy}
                  onChange={(e) => setAgreements({ terms: e.target.checked, privacy: e.target.checked })}
                  className="size-4 cursor-pointer rounded-radius-100 border border-line-outline bg-components-fill-standard-secondary text-core-accent transition-all duration-150 checked:border-core-accent checked:bg-core-accent focus:ring-2 focus:ring-core-accent-translucent group-hover:border-core-accent/50"
                />
                <span className="font-medium text-body text-content-standard-primary">전체 동의</span>
              </label>
              <div className="flex flex-col gap-spacing-200 pl-spacing-100">
                <label className="group flex cursor-pointer items-center gap-spacing-200">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
                    className="size-4 cursor-pointer rounded-radius-100 border border-line-outline bg-components-fill-standard-secondary text-core-accent transition-all duration-150 checked:border-core-accent checked:bg-core-accent focus:ring-2 focus:ring-core-accent-translucent group-hover:border-core-accent/50"
                  />
                  <span className="text-body text-content-standard-secondary">
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-colors hover:text-core-accent">
                      이용약관
                    </a>
                    에 동의합니다 (필수)
                  </span>
                </label>
                <label className="group flex cursor-pointer items-center gap-spacing-200">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) => setAgreements({ ...agreements, privacy: e.target.checked })}
                    className="size-4 cursor-pointer rounded-radius-100 border border-line-outline bg-components-fill-standard-secondary text-core-accent transition-all duration-150 checked:border-core-accent checked:bg-core-accent focus:ring-2 focus:ring-core-accent-translucent group-hover:border-core-accent/50"
                  />
                  <span className="text-body text-content-standard-secondary">
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-colors hover:text-core-accent">
                      개인정보처리방침
                    </a>
                    에 동의합니다 (필수)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
