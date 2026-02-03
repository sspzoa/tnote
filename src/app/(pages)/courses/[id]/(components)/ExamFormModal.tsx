"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";

interface ExamFormData {
  examNumber: number;
  name: string;
  maxScore: number;
  cutline: number;
}

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  courseName?: string;
  initialData?: ExamFormData;
  onSubmit: (data: ExamFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ExamFormModal({
  isOpen,
  onClose,
  mode,
  courseName,
  initialData,
  onSubmit,
  isSubmitting,
}: ExamFormModalProps) {
  const [examNumber, setExamNumber] = useState("");
  const [examName, setExamName] = useState("");
  const [maxScore, setMaxScore] = useState("8");
  const [cutline, setCutline] = useState("4");

  // Reset form when modal opens with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setExamNumber(initialData.examNumber.toString());
      setExamName(initialData.name);
      setMaxScore(initialData.maxScore.toString());
      setCutline(initialData.cutline.toString());
    } else if (isOpen && !initialData) {
      // Reset to defaults for create mode
      setExamNumber("");
      setExamName("");
      setMaxScore("8");
      setCutline("4");
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setExamNumber("");
    setExamName("");
    setMaxScore("8");
    setCutline("4");
    onClose();
  };

  const handleSubmit = async () => {
    if (!examNumber || !examName.trim() || !maxScore || !cutline) {
      alert("모든 정보를 입력해 주세요.");
      return;
    }

    await onSubmit({
      examNumber: Number.parseInt(examNumber),
      name: examName,
      maxScore: Number.parseInt(maxScore),
      cutline: Number.parseInt(cutline),
    });
  };

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "시험 생성" : "시험 수정";
  const submitText = isCreateMode ? "생성" : "저장";
  const loadingText = isCreateMode ? "생성 중..." : "저장 중...";
  const isDisabled = !examNumber || !examName.trim() || !maxScore || !cutline;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
          label="회차"
          required
          type="number"
          value={examNumber}
          onChange={(e) => setExamNumber(e.target.value)}
          placeholder="ex. 1"
          min={1}
        />

        <FormInput
          label="시험 이름"
          required
          type="text"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="예: 복습테스트"
        />

        <div className="flex gap-spacing-400">
          <div className="flex-1">
            <FormInput
              label="만점"
              required
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
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
              onChange={(e) => setCutline(e.target.value)}
              placeholder="4"
              min={0}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
