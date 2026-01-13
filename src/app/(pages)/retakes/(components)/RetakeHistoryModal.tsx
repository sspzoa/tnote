"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { showHistoryModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

export default function RetakeHistoryModal() {
  const [isOpen, setIsOpen] = useAtom(showHistoryModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const { history, isLoading } = useRetakeHistory(selectedRetake?.id || null);

  const getActionLabel = (actionType: string) => {
    const labels = {
      postpone: "연기",
      absent: "결석",
      complete: "완료",
      status_change: "상태 변경",
      management_status_change: "관리 상태 변경",
      note_update: "메모 수정",
    };
    return labels[actionType as keyof typeof labels] || actionType;
  };

  const getActionBadgeStyle = (actionType: string) => {
    if (actionType === "postpone") return "bg-solid-translucent-blue text-solid-blue";
    if (actionType === "absent") return "bg-solid-translucent-red text-solid-red";
    if (actionType === "complete") return "bg-solid-translucent-green text-solid-green";
    if (actionType === "status_change") return "bg-solid-translucent-purple text-solid-purple";
    if (actionType === "management_status_change") return "bg-solid-translucent-yellow text-solid-yellow";
    if (actionType === "note_update") return "bg-components-fill-standard-secondary text-content-standard-secondary";
    return "bg-components-fill-standard-secondary text-content-standard-secondary";
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} - ${selectedRetake.exam.course.name} - ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="재시험 이력"
      subtitle={subtitle}
      maxWidth="lg"
      footer={
        <Button variant="secondary" onClick={() => setIsOpen(false)} className="w-full">
          닫기
        </Button>
      }>
      {isLoading ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
      ) : history.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">이력이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-spacing-400">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
              <div className="mb-spacing-300 flex items-start justify-between">
                <div className="flex flex-col gap-spacing-200">
                  <div className="flex items-center gap-spacing-300">
                    <span
                      className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${getActionBadgeStyle(item.action_type)}`}>
                      {getActionLabel(item.action_type)}
                    </span>
                  </div>
                  {item.action_type === "postpone" && item.previous_date && item.new_date && (
                    <span className="text-body text-content-standard-primary">
                      일정: {item.previous_date} → {item.new_date}
                    </span>
                  )}
                  {item.action_type === "status_change" && item.previous_status && item.new_status && (
                    <span className="text-body text-content-standard-primary">
                      상태:{" "}
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
                      <span className="text-body text-content-standard-primary">
                        관리 상태: {item.previous_management_status} → {item.new_management_status}
                      </span>
                    )}
                </div>
                <span className="text-content-standard-tertiary text-footnote">
                  {new Date(item.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              {item.note && <p className="text-body text-content-standard-secondary">{item.note}</p>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
