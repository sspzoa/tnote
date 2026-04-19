"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { editDateAtom } from "../(atoms)/useFormStore";
import { showEditDateModalAtom } from "../(atoms)/useModalStore";
import { useAssignmentTaskEditDate } from "../(hooks)/useAssignmentTaskEditDate";
import { useAssignmentTaskHistory } from "../(hooks)/useAssignmentTaskHistory";

interface AssignmentTaskEditDateModalProps {
  onSuccess?: () => void;
}

export default function AssignmentTaskEditDateModal({ onSuccess }: AssignmentTaskEditDateModalProps) {
  const [isOpen, setIsOpen] = useAtom(showEditDateModalAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [editDate, setEditDate] = useAtom(editDateAtom);
  const { editDate: updateDate, isEditing } = useAssignmentTaskEditDate();
  const { refetch: refetchHistory } = useAssignmentTaskHistory(selectedTask?.id || null);
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setEditDate("");
  };

  const handleSave = async () => {
    if (!selectedTask || !editDate) {
      toast.info("새로운 날짜를 입력해 주세요.");
      return;
    }

    try {
      await updateDate({
        taskId: selectedTask.id,
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

  if (!selectedTask) return null;

  const subtitle = `${selectedTask.student.name} - ${selectedTask.assignment.course.name} - ${selectedTask.assignment.name}`;

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
      <div className="flex flex-col gap-spacing-400">
        <div className="flex flex-col gap-spacing-200">
          <label className="block font-semibold text-body text-content-standard-primary">현재 예정일</label>
          <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
            {selectedTask.current_scheduled_date || "미지정"}
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
