"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
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
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setEditDate("");
  };

  const handleSave = async () => {
    if (!selectedRetake || !editDate) {
      toast.info("새로운 날짜를 입력해 주세요.");
      return;
    }

    try {
      await updateDate({
        retakeId: selectedRetake.id,
        newDate: editDate,
      });
      toast.success("날짜가 수정되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "날짜 수정에 실패했습니다."));
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSave}
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block font-semibold text-base text-foreground">현재 예정일</label>
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-base text-muted-foreground">
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

        <p className="text-muted-foreground text-xs">날짜 수정은 연기 횟수에 포함되지 않습니다.</p>
      </div>
    </Modal>
  );
}
