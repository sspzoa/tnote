"use client";

import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  courseName?: string;
  examNumber: string;
  examName: string;
  maxScore: string;
  cutline: string;
  onExamNumberChange: (value: string) => void;
  onExamNameChange: (value: string) => void;
  onMaxScoreChange: (value: string) => void;
  onCutlineChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ExamFormModal({
  isOpen,
  onClose,
  mode,
  courseName,
  examNumber,
  examName,
  maxScore,
  cutline,
  onExamNumberChange,
  onExamNameChange,
  onMaxScoreChange,
  onCutlineChange,
  onSubmit,
  isSubmitting,
}: ExamFormModalProps) {
  const isCreateMode = mode === "create";
  const title = isCreateMode ? "시험 생성" : "시험 수정";
  const submitText = isCreateMode ? "생성" : "저장";
  const loadingText = isCreateMode ? "생성 중..." : "저장 중...";
  const isDisabled = !examNumber || !examName.trim() || !maxScore || !cutline;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={isCreateMode && courseName ? courseName : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isDisabled}
            isLoading={isSubmitting}
            loadingText={loadingText}
            className="flex-1">
            {submitText}
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        <FormInput
          label="회차"
          required
          type="number"
          value={examNumber}
          onChange={(e) => onExamNumberChange(e.target.value)}
          placeholder="ex. 1"
          min={1}
        />

        <FormInput
          label="시험 이름"
          required
          type="text"
          value={examName}
          onChange={(e) => onExamNameChange(e.target.value)}
          placeholder="예: 복습테스트"
        />

        <div className="flex gap-spacing-400">
          <div className="flex-1">
            <FormInput
              label="만점"
              required
              type="number"
              value={maxScore}
              onChange={(e) => onMaxScoreChange(e.target.value)}
              placeholder="8"
              min={1}
            />
          </div>
          <div className="flex-1">
            <FormInput
              label="커트라인"
              required
              type="number"
              value={cutline}
              onChange={(e) => onCutlineChange(e.target.value)}
              placeholder="4"
              min={0}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
