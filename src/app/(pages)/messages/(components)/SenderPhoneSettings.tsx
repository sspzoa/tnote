"use client";

import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useSenderPhone } from "../(hooks)/useSenderPhone";

const formatPhoneForDisplay = (phone: string | null): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

interface SenderPhoneSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SenderPhoneSettings({ isOpen, onClose }: SenderPhoneSettingsProps) {
  const { senderPhoneNumber, isLoading, updateSenderPhoneAsync, isUpdating } = useSenderPhone();
  const [phoneInput, setPhoneInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhoneInput(formatPhoneForDisplay(senderPhoneNumber));
      setError(null);
    }
  }, [isOpen, senderPhoneNumber]);

  const handleSave = async () => {
    setError(null);

    const cleaned = phoneInput.replace(/\D/g, "");

    if (cleaned && !/^0\d{9,10}$/.test(cleaned)) {
      setError("올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)");
      return;
    }

    try {
      await updateSenderPhoneAsync(cleaned || null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 11) {
      let formatted = cleaned;
      if (cleaned.length > 3 && cleaned.length <= 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (cleaned.length > 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
      }
      setPhoneInput(formatted);
      setError(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="발신번호 설정"
      subtitle="문자 발송 시 사용할 발신번호를 설정합니다"
      maxWidth="sm"
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
        <div className="flex items-center justify-center py-spacing-600">
          <div className="size-6 animate-spin rounded-full border-2 border-core-accent border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-spacing-400">
          <FormInput
            label="발신번호"
            value={phoneInput}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            error={error || undefined}
          />
          <div className="rounded-radius-300 bg-solid-translucent-yellow p-spacing-400">
            <p className="font-semibold text-label text-solid-yellow">주의사항</p>
            <ul className="mt-spacing-200 list-inside list-disc space-y-spacing-100 text-content-standard-secondary text-footnote">
              <li>SOLAPI에 등록된 발신번호만 사용 가능합니다.</li>
              <li>미등록 번호로 발송 시 실패할 수 있습니다.</li>
              <li>발신번호 등록은 SOLAPI 콘솔에서 진행해주세요.</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
