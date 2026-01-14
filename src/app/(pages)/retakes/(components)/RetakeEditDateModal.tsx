"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { editDateAtom } from "../(atoms)/useFormStore";
import { showEditDateModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeEditDate } from "../(hooks)/useRetakeEditDate";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

interface RetakeEditDateModalProps {
  onSuccess?: () => void;
}

export default function RetakeEditDateModal({ onSuccess }: RetakeEditDateModalProps) {
  const [isOpen, setIsOpen] = useAtom(showEditDateModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [editDate, setEditDate] = useAtom(editDateAtom);
  const { editDate: updateDate, isEditing } = useRetakeEditDate();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);

  const handleClose = () => {
    setIsOpen(false);
    setEditDate("");
  };

  const handleSave = async () => {
    if (!selectedRetake || !editDate) {
      alert("새로운 날짜를 입력해주세요.");
      return;
    }

    try {
      await updateDate({
        retakeId: selectedRetake.id,
        newDate: editDate,
      });
      alert("날짜가 수정되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "날짜 수정에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="날짜 수정"
      subtitle={subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isEditing} className="flex-1">
            취소
          </Button>
          <Button onClick={handleSave} disabled={!editDate || isEditing} isLoading={isEditing} className="flex-1">
            저장
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        <div>
          <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
            현재 예정일
          </label>
          <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
            {selectedRetake.current_scheduled_date || "미지정"}
          </div>
        </div>

        <FormInput
          label="새로운 날짜"
          required
          type="date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
        />

        <p className="text-content-standard-tertiary text-footnote">날짜 수정은 연기 횟수에 포함되지 않습니다.</p>
      </div>
    </Modal>
  );
}
