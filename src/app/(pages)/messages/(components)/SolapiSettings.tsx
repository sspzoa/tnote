"use client";

import { Info, KeyRound, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { SectionCard } from "@/shared/components/ui/sectionCard";
import { SkeletonSpinner } from "@/shared/components/ui/skeleton";
import { useSolapiSettings } from "../(hooks)/useSolapiSettings";

const SOLAPI_NOTICES = [
  "SOLAPI 콘솔에서 API 키를 발급받을 수 있습니다.",
  "API 키는 워크스페이스별로 별도 관리됩니다.",
  "키를 모두 비우면 문자 발송 기능이 비활성화됩니다.",
];

interface SolapiSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SolapiSettings({ isOpen, onClose }: SolapiSettingsProps) {
  const { apiKey, apiSecret, isLoading, updateSolapiSettingsAsync, isUpdating } = useSolapiSettings();
  const [keyInput, setKeyInput] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKeyInput("");
      setSecretInput("");
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setError(null);

    const trimmedKey = keyInput.trim();
    const trimmedSecret = secretInput.trim();

    if ((trimmedKey && !trimmedSecret) || (!trimmedKey && trimmedSecret)) {
      setError("API 키와 API 시크릿을 모두 입력하거나 모두 비워주세요.");
      return;
    }

    try {
      await updateSolapiSettingsAsync({
        apiKey: trimmedKey || null,
        apiSecret: trimmedSecret || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SOLAPI 설정"
      subtitle="문자 발송에 사용할 SOLAPI API 키를 설정합니다"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            <X />
            취소
          </Button>
          <Button onClick={handleSave} isLoading={isUpdating} loadingText="저장 중...">
            <Save />
            저장
          </Button>
        </div>
      }>
      {isLoading ? (
        <SkeletonSpinner className="py-7" size="md" />
      ) : (
        <div className="flex flex-col gap-4">
          <SectionCard title="API 인증 정보" icon={KeyRound} tone="messages">
            <div className="flex flex-col gap-4">
              <FormInput
                label="API Key"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setError(null);
                }}
                placeholder={apiKey ? `현재: ${apiKey}` : "SOLAPI API Key를 입력하세요"}
              />
              <FormInput
                label="API Secret"
                type="password"
                value={secretInput}
                onChange={(e) => {
                  setSecretInput(e.target.value);
                  setError(null);
                }}
                placeholder={apiSecret ? `현재: ${apiSecret}` : "SOLAPI API Secret를 입력하세요"}
              />
              {error && (
                <p className="text-destructive text-xs" role="alert">
                  {error}
                </p>
              )}
            </div>
          </SectionCard>
          <div className="flex gap-3 rounded-xl border border-warning/20 bg-warning-soft p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning [&_svg]:size-4">
              <Info />
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-foreground text-sm">안내사항</p>
              <ul className="flex flex-col gap-1.5">
                {SOLAPI_NOTICES.map((notice) => (
                  <li key={notice} className="flex gap-2 text-muted-foreground text-xs leading-relaxed">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" aria-hidden />
                    <span>{notice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
