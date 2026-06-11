"use client";

import { useAtom } from "jotai";
import { CalendarClock } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DateChip } from "@/shared/components/ui/dateChip";
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

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "검사예정", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  insufficient: { label: "미흡", variant: "danger" },
  not_submitted: { label: "미제출", variant: "danger" },
  absent: { label: "결석", variant: "danger" },
};

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

  const status = STATUS_CONFIG[selectedTask.status] ?? { label: selectedTask.status, variant: "neutral" as const };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSave}
      title="날짜 수정"
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
      <div className="flex flex-col gap-5">
        {/* 대상 요약 — 누구의 / 어떤 과제를 / 현재 어떤 상태로 수정하는지 */}
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-foreground">{selectedTask.student.name}</span>
                <Badge variant={status.variant} size="sm">
                  {status.label}
                </Badge>
              </div>
              <span className="truncate text-muted-foreground text-sm">
                {selectedTask.assignment.course.name} · {selectedTask.assignment.name}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-border/60 border-t pt-3">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <CalendarClock className="size-3.5" />
              현재 예정일
            </span>
            <DateChip>{selectedTask.current_scheduled_date || "미지정"}</DateChip>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FormInput
            label="새로운 날짜"
            required
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">날짜 수정은 연기 횟수에 포함되지 않습니다.</p>
        </div>
      </div>
    </Modal>
  );
}
