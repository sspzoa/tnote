"use client";

import { useAtom } from "jotai";
import { CalendarClock, UserX } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { absentNoteAtom } from "../(atoms)/useFormStore";
import { showAbsentModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeAbsent } from "../(hooks)/useRetakeAbsent";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

interface RetakeAbsentModalProps {
  onSuccess?: () => void;
}

// 재시험 상태 라벨/배지 매핑 — action-confirm 모달 전반에서 공유하는 형태
const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "대기중", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  absent: { label: "결석", variant: "danger" },
};

export default function RetakeAbsentModal({ onSuccess }: RetakeAbsentModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAbsentModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [absentNote, setAbsentNote] = useAtom(absentNoteAtom);
  const { markAbsent, isMarkingAbsent } = useRetakeAbsent();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setAbsentNote("");
  };

  const handleAbsent = async () => {
    if (!selectedRetake) return;

    try {
      await markAbsent({
        retakeId: selectedRetake.id,
        data: { note: absentNote || null },
      });
      toast.success("결석 처리되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "결석 처리에 실패했습니다."));
    }
  };

  if (!selectedRetake) return null;

  const status = STATUS_CONFIG[selectedRetake.status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleAbsent}
      title="결석 처리"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isMarkingAbsent} className="flex-1">
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleAbsent}
            disabled={isMarkingAbsent}
            isLoading={isMarkingAbsent}
            className="flex-1">
            결석 처리
          </Button>
        </>
      }>
      <div className="flex flex-col gap-4">
        {/* 대상 레코드 요약 — 결석은 되돌리기 어려운 처리이므로 누구·무엇·현재상태를 명확히 보여준다 */}
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive-soft/40 p-4">
          <div className="flex items-start gap-3">
            <IconBadge icon={UserX} tone="destructive" size="md" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-base text-foreground">{selectedRetake.student.name}</span>
                {selectedRetake.student.school && (
                  <span className="text-muted-foreground text-xs">{selectedRetake.student.school}</span>
                )}
                {status && (
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                )}
              </div>
              <span className="truncate text-muted-foreground text-sm">
                {selectedRetake.exam.course.name} · {selectedRetake.exam.name} {selectedRetake.exam.exam_number}회차
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-destructive/15 border-t pt-3">
            <span className="inline-flex items-center gap-1.5 text-foreground text-sm">
              <CalendarClock className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">예정일</span>
              <span className="font-medium tabular-nums">{selectedRetake.current_scheduled_date || "미지정"}</span>
            </span>
            {selectedRetake.absent_count > 0 && (
              <span className="text-muted-foreground text-xs">
                기존 결석{" "}
                <span className="font-medium text-foreground tabular-nums">{selectedRetake.absent_count}</span>회
              </span>
            )}
          </div>
        </div>

        <FormTextarea
          label="결석 사유 (선택사항)"
          value={absentNote}
          onChange={(e) => setAbsentNote(e.target.value)}
          rows={3}
          placeholder="결석 사유를 입력하세요"
        />
      </div>
    </Modal>
  );
}
