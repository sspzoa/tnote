"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import { showPostponeModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";
import { useRetakePostpone } from "../(hooks)/useRetakePostpone";

interface RetakePostponeModalProps {
  onSuccess?: () => void;
}

export default function RetakePostponeModal({ onSuccess }: RetakePostponeModalProps) {
  const [isOpen, setIsOpen] = useAtom(showPostponeModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [postponeDate, setPostponeDate] = useAtom(postponeDateAtom);
  const [postponeNote, setPostponeNote] = useAtom(postponeNoteAtom);
  const { postponeRetake } = useRetakePostpone();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);

  const handleClose = () => {
    setIsOpen(false);
    setPostponeDate("");
    setPostponeNote("");
  };

  const handlePostpone = async () => {
    if (!selectedRetake || !postponeDate) {
      alert("새로운 날짜를 입력해주세요.");
      return;
    }

    try {
      await postponeRetake({
        retakeId: selectedRetake.id,
        data: { newDate: postponeDate, note: postponeNote || null },
      });
      alert("재시험이 연기되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "연기 처리에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="재시험 연기"
      subtitle={subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handlePostpone} disabled={!postponeDate} className="flex-1">
            연기
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        <div>
          <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
            현재 예정일
          </label>
          <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
            {selectedRetake.current_scheduled_date}
          </div>
        </div>

        <FormInput
          label="새로운 날짜"
          required
          type="date"
          value={postponeDate}
          onChange={(e) => setPostponeDate(e.target.value)}
        />

        <FormTextarea
          label="연기 사유 (선택사항)"
          value={postponeNote}
          onChange={(e) => setPostponeNote(e.target.value)}
          rows={3}
          placeholder="연기 사유를 입력하세요"
        />
      </div>
    </Modal>
  );
}
