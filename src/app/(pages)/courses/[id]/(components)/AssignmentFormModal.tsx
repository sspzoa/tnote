"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  courseName?: string;
  initialData?: { name: string };
  onSubmit: (data: { name: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function AssignmentFormModal({
  isOpen,
  onClose,
  mode,
  courseName,
  initialData,
  onSubmit,
  isSubmitting,
}: AssignmentFormModalProps) {
  const [name, setName] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
    } else if (isOpen && !initialData) {
      setName("");
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setName("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.info("과제 이름을 입력해 주세요.");
      return;
    }

    await onSubmit({ name });
  };

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "과제 생성" : "과제 수정";
  const submitText = isCreateMode ? "생성" : "저장";
  const loadingText = isCreateMode ? "생성 중..." : "저장 중...";
  const isDisabled = !name.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={title}
      subtitle={isCreateMode && courseName ? courseName : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isDisabled}
            isLoading={isSubmitting}
            loadingText={loadingText}
            className="flex-1">
            {submitText}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-400">
        <FormInput
          label="과제 이름"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 단어 암기 과제"
        />
      </div>
    </Modal>
  );
}
