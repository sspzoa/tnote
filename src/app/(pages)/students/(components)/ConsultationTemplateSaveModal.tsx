"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";

interface ConsultationTemplateSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  defaultName: string;
  content: string;
}

export default function ConsultationTemplateSaveModal({
  isOpen,
  onClose,
  onSave,
  defaultName,
  content,
}: ConsultationTemplateSaveModalProps) {
  const [name, setName] = useState(defaultName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || isLoading) return;
    setIsLoading(true);
    try {
      await onSave(name.trim());
      setName("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="템플릿 저장"
      subtitle="현재 상담 내용을 템플릿으로 저장합니다"
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
            isLoading={isLoading}
            loadingText="저장 중...">
            저장
          </Button>
        </>
      }>
      <FormInput
        label="템플릿 이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="템플릿 이름을 입력하세요"
        required
        disabled={isLoading}
      />
      <div className="mt-spacing-400">
        <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
          저장할 내용
        </label>
        <div className="max-h-40 overflow-y-auto rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
          <p className="whitespace-pre-wrap text-body text-content-standard-secondary">{content}</p>
        </div>
      </div>
    </Modal>
  );
}
