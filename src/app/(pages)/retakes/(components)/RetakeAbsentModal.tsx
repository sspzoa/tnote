"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { absentNoteAtom } from "../(atoms)/useFormStore";
import { showAbsentModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeAbsent } from "../(hooks)/useRetakeAbsent";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

interface RetakeAbsentModalProps {
  onSuccess?: () => void;
}

export default function RetakeAbsentModal({ onSuccess }: RetakeAbsentModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAbsentModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [absentNote, setAbsentNote] = useAtom(absentNoteAtom);
  const { markAbsent } = useRetakeAbsent();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);

  const handleClose = () => {
    setIsOpen(false);
    setAbsentNote("");
  };

  const handleAbsent = async () => {
    if (!selectedRetake) return;

    try {
      await markAbsent({
        retakeId: selectedRetake.id,
        data: { note: absentNote || null },
      });
      alert("결석 처리되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "결석 처리에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="결석 처리"
      subtitle={subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button variant="danger" onClick={handleAbsent} className="flex-1">
            결석 처리
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
          label="결석 사유 (선택사항)"
          value={absentNote}
          onChange={(e) => setAbsentNote(e.target.value)}
          rows={3}
          placeholder="결석 사유를 입력하세요"
        />
      </div>
    </Modal>
  );
}
