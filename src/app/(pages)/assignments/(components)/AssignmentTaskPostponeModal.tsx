"use client";

import { useAtom } from "jotai";
import { CalendarClock } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DateChip } from "@/shared/components/ui/dateChip";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import type { AssignmentTaskStatus } from "@/shared/types";
import { selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import { showPostponeModalAtom } from "../(atoms)/useModalStore";
import { useAssignmentTaskHistory } from "../(hooks)/useAssignmentTaskHistory";
import { useAssignmentTaskPostpone } from "../(hooks)/useAssignmentTaskPostpone";

interface AssignmentTaskPostponeModalProps {
  onSuccess?: () => void;
}

const STATUS_CONFIG: Record<AssignmentTaskStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "검사예정", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  insufficient: { label: "미흡", variant: "danger" },
  not_submitted: { label: "미제출", variant: "danger" },
  absent: { label: "결석", variant: "danger" },
};

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

  const status = STATUS_CONFIG[selectedTask.status];
  const subtitle = `${selectedTask.assignment.course.name} · ${selectedTask.assignment.name}`;

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-semibold text-foreground text-sm">{selectedTask.student.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {selectedTask.assignment.course.name} · {selectedTask.assignment.name}
              </span>
            </div>
            {status && (
              <Badge variant={status.variant} size="sm">
                {status.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between border-border/60 border-t pt-3">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <CalendarClock className="size-3.5" />
              현재 예정일
            </span>
            {selectedTask.current_scheduled_date ? (
              <DateChip>{selectedTask.current_scheduled_date}</DateChip>
            ) : (
              <span className="text-muted-foreground text-xs">미지정</span>
            )}
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
