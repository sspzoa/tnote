"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import { showPostponeModalAtom } from "../(atoms)/useModalStore";
import { useAssignmentTaskHistory } from "../(hooks)/useAssignmentTaskHistory";
import { useAssignmentTaskPostpone } from "../(hooks)/useAssignmentTaskPostpone";

interface AssignmentTaskPostponeModalProps {
  onSuccess?: () => void;
}

export default function AssignmentTaskPostponeModal({ onSuccess }: AssignmentTaskPostponeModalProps) {
  const [isOpen, setIsOpen] = useAtom(showPostponeModalAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [postponeDate, setPostponeDate] = useAtom(postponeDateAtom);
  const [postponeNote, setPostponeNote] = useAtom(postponeNoteAtom);
  const { postponeTask, isPostponing } = useAssignmentTaskPostpone();
  const { refetch: refetchHistory } = useAssignmentTaskHistory(selectedTask?.id || null);
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setPostponeDate("");
    setPostponeNote("");
  };

  const handlePostpone = async () => {
    if (!selectedTask || !postponeDate) {
      toast.info("새로운 날짜를 입력해 주세요.");
      return;
    }
    if (!postponeNote.trim()) {
      toast.info("연기 사유를 입력해 주세요.");
      return;
    }

    try {
      await postponeTask({
        taskId: selectedTask.id,
        data: { newDate: postponeDate, note: postponeNote || null },
      });
      toast.success("과제가 연기되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "연기 처리에 실패했습니다."));
    }
  };

  if (!selectedTask) return null;

  const subtitle = `${selectedTask.student.name} - ${selectedTask.assignment.course.name} - ${selectedTask.assignment.name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handlePostpone}
      title="과제 연기"
      subtitle={subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isPostponing} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handlePostpone}
            disabled={!postponeDate || !postponeNote.trim() || isPostponing}
            isLoading={isPostponing}
            className="flex-1">
            연기
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-400">
        <div className="flex flex-col gap-spacing-200">
          <label className="block font-semibold text-body text-content-standard-primary">현재 예정일</label>
          <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
            {selectedTask.current_scheduled_date}
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
          label="연기 사유"
          required
          value={postponeNote}
          onChange={(e) => setPostponeNote(e.target.value)}
          rows={3}
          placeholder="연기 사유를 입력하세요"
        />
      </div>
    </Modal>
  );
}
