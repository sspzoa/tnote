"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { completeNoteAtom } from "../(atoms)/useFormStore";
import { showCompleteModalAtom } from "../(atoms)/useModalStore";
import { useAssignmentTaskComplete } from "../(hooks)/useAssignmentTaskComplete";
import { useAssignmentTaskHistory } from "../(hooks)/useAssignmentTaskHistory";

interface AssignmentTaskCompleteModalProps {
  onSuccess?: () => void;
}

export default function AssignmentTaskCompleteModal({ onSuccess }: AssignmentTaskCompleteModalProps) {
  const [isOpen, setIsOpen] = useAtom(showCompleteModalAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [completeNote, setCompleteNote] = useAtom(completeNoteAtom);
  const { completeTask, isCompleting } = useAssignmentTaskComplete();
  const { refetch: refetchHistory } = useAssignmentTaskHistory(selectedTask?.id || null);
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setCompleteNote("");
  };

  const handleComplete = async () => {
    if (!selectedTask) return;

    try {
      await completeTask({
        taskId: selectedTask.id,
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

  if (!selectedTask) return null;

  const subtitle = `${selectedTask.student.name} - ${selectedTask.assignment.course.name} - ${selectedTask.assignment.name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleComplete}
      title="완료 처리"
      subtitle={subtitle}
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
      <div className="flex flex-col gap-spacing-400">
        <div className="flex flex-col gap-spacing-200">
          <label className="block font-semibold text-body text-content-standard-primary">예정일</label>
          <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
            {selectedTask.current_scheduled_date}
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
