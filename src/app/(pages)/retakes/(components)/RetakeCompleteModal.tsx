"use client";

import { useAtom } from "jotai";
import { CircleCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { completeNoteAtom } from "../(atoms)/useFormStore";
import { showCompleteModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeComplete } from "../(hooks)/useRetakeComplete";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";
import { RetakeRecordSummary } from "./RetakeRecordSummary";

interface RetakeCompleteModalProps {
  onSuccess?: () => void;
}

export default function RetakeCompleteModal({ onSuccess }: RetakeCompleteModalProps) {
  const [isOpen, setIsOpen] = useAtom(showCompleteModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [completeNote, setCompleteNote] = useAtom(completeNoteAtom);
  const { completeRetake, isCompleting } = useRetakeComplete();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setCompleteNote("");
  };

  const handleComplete = async () => {
    if (!selectedRetake) return;

    try {
      await completeRetake({
        retakeId: selectedRetake.id,
        data: { note: completeNote || null },
      });
      toast.success("완료 처리되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "완료 처리에 실패했습니다."));
    }
  };

  if (!selectedRetake) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleComplete}
      title="완료 처리"
      subtitle="재시험을 완료로 처리합니다"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isCompleting} className="flex-1">
            취소
          </Button>
          <Button
            variant="success"
            onClick={handleComplete}
            disabled={isCompleting}
            isLoading={isCompleting}
            className="flex-1">
            완료 처리
          </Button>
        </>
      }>
      <div className="flex flex-col gap-4">
        <RetakeRecordSummary retake={selectedRetake} accentIcon={CircleCheck} accentTone="success" />

        <FormTextarea
          label="메모 (선택사항)"
          value={completeNote}
          onChange={(e) => setCompleteNote(e.target.value)}
          rows={3}
          placeholder="메모를 입력하세요"
        />
      </div>
    </Modal>
  );
}
