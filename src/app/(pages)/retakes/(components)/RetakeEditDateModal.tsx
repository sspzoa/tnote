"use client";

import { useAtom } from "jotai";
import { CalendarClock, Info } from "lucide-react";
import { TransitionChip } from "@/shared/components/common/FeedItem";
import { Badge } from "@/shared/components/ui/badge";
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

const STATUS_BADGE: Record<
  "pending" | "completed" | "absent",
  { label: string; variant: "warning" | "success" | "danger" }
> = {
  pending: { label: "대기중", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  absent: { label: "결석", variant: "danger" },
};

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

  const status = STATUS_BADGE[selectedRetake.status];
  const currentDate = selectedRetake.current_scheduled_date || "미지정";

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
        {/* 대상 재시험 요약 */}
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-foreground text-sm">{selectedRetake.student.name}</span>
                <Badge variant={status.variant} size="sm">
                  {status.label}
                </Badge>
              </div>
              <span className="truncate text-muted-foreground text-xs">
                {selectedRetake.exam.course.name} · {selectedRetake.exam.name} {selectedRetake.exam.exam_number}회차
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-border/70 border-t pt-3">
            <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <CalendarClock className="size-3.5" />
              현재 예정일
            </span>
            <span className="font-medium text-foreground text-sm tabular-nums">{currentDate}</span>
          </div>
        </div>

        {/* 새로운 날짜 */}
        <div className="flex flex-col gap-3">
          <FormInput
            label="새로운 날짜"
            required
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          {editDate && <TransitionChip from={currentDate} to={editDate} />}

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-muted-foreground text-xs">
            <Info className="mt-px size-3.5 shrink-0" />
            <span>날짜 수정은 연기 횟수에 포함되지 않습니다.</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
