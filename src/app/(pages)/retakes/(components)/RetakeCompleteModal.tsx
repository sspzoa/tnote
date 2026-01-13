"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { completeNoteAtom } from "../(atoms)/useFormStore";
import { showCompleteModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeComplete } from "../(hooks)/useRetakeComplete";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

interface RetakeCompleteModalProps {
  onSuccess?: () => void;
}

export default function RetakeCompleteModal({ onSuccess }: RetakeCompleteModalProps) {
  const [isOpen, setIsOpen] = useAtom(showCompleteModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [completeNote, setCompleteNote] = useAtom(completeNoteAtom);
  const { completeRetake } = useRetakeComplete();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);

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
      alert("완료 처리되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "완료 처리에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="완료 처리"
      subtitle={subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button variant="success" onClick={handleComplete} className="flex-1">
            완료 처리
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        <div>
          <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">예정일</label>
          <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
            {selectedRetake.current_scheduled_date}
          </div>
        </div>

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
