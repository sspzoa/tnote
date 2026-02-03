"use client";

import { useAtom } from "jotai";
import { Undo2 } from "lucide-react";
import { useEffect } from "react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { showHistoryModalAtom } from "../(atoms)/useModalStore";
import type { History } from "../(atoms)/useRetakesStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";
import { useRetakeUndo } from "../(hooks)/useRetakeUndo";
import { HistoryListSkeleton } from "./HistoryListSkeleton";

interface RetakeHistoryModalProps {
  onSuccess?: () => void;
}

export default function RetakeHistoryModal({ onSuccess }: RetakeHistoryModalProps) {
  const [isOpen, setIsOpen] = useAtom(showHistoryModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const { history, isLoading, refetch } = useRetakeHistory(selectedRetake?.id || null);
  const { undoAction, isUndoing } = useRetakeUndo();

  // 모달이 열릴 때마다 이력 새로고침
  useEffect(() => {
    if (isOpen && selectedRetake?.id) {
      refetch();
    }
  }, [isOpen, selectedRetake?.id, refetch]);

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      assign: "할당",
      postpone: "연기",
      absent: "결석",
      complete: "완료",
      status_change: "상태 변경",
      management_status_change: "관리 상태 변경",
      note_update: "메모 수정",
      date_edit: "날짜 수정",
    };
    return labels[actionType] || actionType;
  };

  const getActionBadgeVariant = (actionType: string): BadgeVariant => {
    if (actionType === "assign") return "purple";
    if (actionType === "postpone") return "blue";
    if (actionType === "absent") return "red";
    if (actionType === "complete") return "green";
    if (actionType === "status_change") return "purple";
    if (actionType === "management_status_change") return "yellow";
    if (actionType === "date_edit") return "blue";
    if (actionType === "note_update") return "neutral";
    return "neutral";
  };

  const canUndo = (item: History, index: number) => {
    // 가장 최근 이력만 되돌릴 수 있음 (index 0)
    if (index !== 0) return false;
    // note_update는 되돌릴 수 없음
    if (item.action_type === "note_update") return false;
    return true;
  };

  const handleUndo = async (item: History) => {
    if (!selectedRetake) return;

    if (!confirm(`"${getActionLabel(item.action_type)}" 작업을 되돌리시겠습니까?`)) {
      return;
    }

    try {
      await undoAction({
        retakeId: selectedRetake.id,
        historyId: item.id,
      });
      alert("작업이 되돌려졌습니다.");
      await refetch();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "되돌리기에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="재시험 이력"
      subtitle={subtitle}
      footer={
        <Button variant="secondary" onClick={() => setIsOpen(false)} className="w-full">
          닫기
        </Button>
      }>
      {isLoading ? (
        <HistoryListSkeleton count={4} />
      ) : history.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">이력이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-spacing-400">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
              <div className="flex items-center justify-between gap-spacing-300">
                <div className="flex min-w-0 flex-1 items-center gap-spacing-300">
                  <Badge variant={getActionBadgeVariant(item.action_type)} size="sm">
                    {getActionLabel(item.action_type)}
                  </Badge>
                  {item.action_type === "assign" && item.new_date && (
                    <span className="truncate text-body text-content-standard-primary">예정일: {item.new_date}</span>
                  )}
                  {item.action_type === "assign" && !item.new_date && (
                    <span className="truncate text-body text-content-standard-tertiary">예정일 미지정</span>
                  )}
                  {(item.action_type === "postpone" ||
                    item.action_type === "date_edit" ||
                    item.action_type === "complete") &&
                    item.new_date && (
                      <span className="truncate text-body text-content-standard-primary">
                        {item.previous_date || "미지정"} → {item.new_date}
                      </span>
                    )}
                  {item.action_type === "status_change" && item.previous_status && item.new_status && (
                    <span className="truncate text-body text-content-standard-primary">
                      {item.previous_status === "pending"
                        ? "대기중"
                        : item.previous_status === "completed"
                          ? "완료"
                          : "결석"}{" "}
                      → {item.new_status === "pending" ? "대기중" : item.new_status === "completed" ? "완료" : "결석"}
                    </span>
                  )}
                  {item.action_type === "management_status_change" &&
                    item.previous_management_status &&
                    item.new_management_status && (
                      <span className="truncate text-body text-content-standard-primary">
                        {item.previous_management_status} → {item.new_management_status}
                      </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-spacing-300">
                  <div className="flex shrink-0 flex-col items-end gap-spacing-50">
                    <span className="text-content-standard-tertiary text-footnote">
                      {new Date(item.created_at).toLocaleString("ko-KR")}
                    </span>
                    {item.performed_by && (
                      <span className="text-content-standard-tertiary text-footnote">{item.performed_by.name}</span>
                    )}
                  </div>
                  {canUndo(item, index) && (
                    <button
                      onClick={() => handleUndo(item)}
                      disabled={isUndoing}
                      className="rounded-radius-200 p-spacing-200 text-content-standard-tertiary transition-colors hover:bg-components-interactive-hover hover:text-content-standard-primary disabled:opacity-50"
                      title="되돌리기">
                      <Undo2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {item.note && <p className="text-body text-content-standard-secondary">{item.note}</p>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
