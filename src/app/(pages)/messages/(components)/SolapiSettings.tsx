"use client";

import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { SkeletonSpinner } from "@/shared/components/ui/skeleton";
import { useSolapiSettings } from "../(hooks)/useSolapiSettings";

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
      setKeyInput(apiKey || "");
      setSecretInput(apiSecret || "");
      setError(null);
    }
  }, [isOpen, apiKey, apiSecret]);

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
        <div className="flex w-full justify-end gap-spacing-200">
          <Button variant="secondary" onClick={onClose}>
            <span className="flex items-center gap-spacing-200">
              <X className="size-4" />
              취소
            </span>
          </Button>
          <Button onClick={handleSave} isLoading={isUpdating} loadingText="저장 중...">
            <span className="flex items-center gap-spacing-200">
              <Save className="size-4" />
              저장
            </span>
          </Button>
        </div>
      }>
      {isLoading ? (
        <SkeletonSpinner className="py-spacing-600" size="md" />
      ) : (
        <div className="flex flex-col gap-spacing-400">
          <FormInput
            label="API Key"
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setError(null);
            }}
            placeholder="SOLAPI API Key를 입력하세요"
            error={error && !keyInput.trim() && secretInput.trim() ? error : undefined}
          />
          <FormInput
            label="API Secret"
            type="password"
            value={secretInput}
            onChange={(e) => {
              setSecretInput(e.target.value);
              setError(null);
            }}
            placeholder="SOLAPI API Secret를 입력하세요"
            error={error && keyInput.trim() && !secretInput.trim() ? error : undefined}
          />
          {error && <p className="text-core-status-negative text-footnote">{error}</p>}
          <div className="flex flex-col gap-spacing-200 rounded-radius-300 bg-solid-translucent-yellow p-spacing-400">
            <p className="font-semibold text-core-status-warning text-label">안내사항</p>
            <ul className="flex list-inside list-disc flex-col gap-spacing-100 text-content-standard-secondary text-footnote">
              <li>SOLAPI 콘솔에서 API 키를 발급받을 수 있습니다.</li>
              <li>API 키는 워크스페이스별로 별도 관리됩니다.</li>
              <li>키를 모두 비우면 문자 발송 기능이 비활성화됩니다.</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
