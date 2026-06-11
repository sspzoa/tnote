"use client";

import { useAtom } from "jotai";
import { CalendarClock } from "lucide-react";
import { TransitionChip } from "@/shared/components/common/FeedItem";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import { showPostponeModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";
import { useRetakePostpone } from "../(hooks)/useRetakePostpone";

interface RetakePostponeModalProps {
  onSuccess?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "대기중", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  absent: { label: "결석", variant: "danger" },
};

export default function RetakePostponeModal({ onSuccess }: RetakePostponeModalProps) {
  const [isOpen, setIsOpen] = useAtom(showPostponeModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [postponeDate, setPostponeDate] = useAtom(postponeDateAtom);
  const [postponeNote, setPostponeNote] = useAtom(postponeNoteAtom);
  const { postponeRetake, isPostponing } = useRetakePostpone();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setPostponeDate("");
    setPostponeNote("");
  };

  const handlePostpone = async () => {
    if (!selectedRetake || !postponeDate) {
      toast.info("새로운 날짜를 입력해 주세요.");
      return;
    }
    if (!postponeNote.trim()) {
      toast.info("연기 사유를 입력해 주세요.");
      return;
    }

    try {
      await postponeRetake({
        retakeId: selectedRetake.id,
        data: { newDate: postponeDate, note: postponeNote || null },
      });
      toast.success("재시험이 연기되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "연기 처리에 실패했습니다."));
    }
  };

  if (!selectedRetake) return null;

  const status = STATUS_CONFIG[selectedRetake.status];
  const currentDate = selectedRetake.current_scheduled_date;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handlePostpone}
      title="재시험 연기"
      subtitle="예정일을 새로운 날짜로 옮깁니다."
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
      <div className="flex flex-col gap-5">
        {/* 대상 레코드 요약 */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-foreground">{selectedRetake.student.name}</span>
                {status && (
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                )}
              </div>
              <span className="truncate text-muted-foreground text-sm">
                {selectedRetake.exam.course.name} · {selectedRetake.exam.name} {selectedRetake.exam.exam_number}회차
              </span>
              {(selectedRetake.postpone_count > 0 || selectedRetake.absent_count > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedRetake.postpone_count > 0 && (
                    <Badge variant="neutral" size="xs">
                      연기 {selectedRetake.postpone_count}회
                    </Badge>
                  )}
                  {selectedRetake.absent_count > 0 && (
                    <Badge variant="neutral" size="xs">
                      결석 {selectedRetake.absent_count}회
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 현재 예정일 → (선택 시) 새로운 날짜 미리보기 */}
          <div className="flex items-center justify-between gap-3 border-border border-t pt-3">
            <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <CalendarClock className="size-3.5" />
              현재 예정일
            </span>
            {postponeDate ? (
              <TransitionChip tone="warning" from={currentDate || "미지정"} to={postponeDate} />
            ) : (
              <span className="font-medium text-foreground text-sm tabular-nums">{currentDate || "미지정"}</span>
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
