"use client";

import { useAtom } from "jotai";
import { CalendarClock } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DateChip } from "@/shared/components/ui/dateChip";
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

const STATUS_LABEL: Record<string, string> = {
  pending: "검사예정",
  completed: "완료",
  insufficient: "미흡",
  not_submitted: "미제출",
  absent: "결석",
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "warning",
  completed: "success",
  insufficient: "danger",
  not_submitted: "danger",
  absent: "danger",
};

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

  const statusKey = selectedTask.status;
  const subtitle = `${selectedTask.assignment.course.name} · ${selectedTask.assignment.name}`;

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-foreground text-sm">{selectedTask.student.name}</span>
                <Badge variant={STATUS_VARIANT[statusKey] ?? "neutral"} size="xs">
                  {STATUS_LABEL[statusKey] ?? statusKey}
                </Badge>
              </div>
              <span className="truncate text-muted-foreground text-xs">
                {selectedTask.assignment.course.name} · {selectedTask.assignment.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-border border-t pt-3">
            <span className="text-muted-foreground text-xs">예정일</span>
            <DateChip>
              <CalendarClock className="mr-1 size-3" />
              {selectedTask.current_scheduled_date ?? "미지정"}
            </DateChip>
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
