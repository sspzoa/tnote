"use client";

import { History, X } from "lucide-react";

interface HistoryItem {
  id: string;
  action_type: string;
  created_at: string;
  note: string | null;
  previous_date: string | null;
  new_date: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  performed_by: { name: string } | null;
  retake: {
    student: { name: string };
    exam: {
      name: string;
      exam_number: number;
      course: { name: string };
    };
  };
}

interface RetakeHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  isLoading: boolean;
}

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

const getActionBadgeStyle = (actionType: string) => {
  if (actionType === "assign") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "postpone") return "bg-solid-translucent-blue text-solid-blue";
  if (actionType === "absent") return "bg-solid-translucent-red text-solid-red";
  if (actionType === "complete") return "bg-solid-translucent-green text-solid-green";
  if (actionType === "status_change") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "management_status_change") return "bg-solid-translucent-yellow text-solid-yellow";
  if (actionType === "date_edit") return "bg-solid-translucent-blue text-solid-blue";
  return "bg-components-fill-standard-secondary text-content-standard-secondary";
};

export default function RetakeHistoryPanel({ isOpen, onClose, history, isLoading }: RetakeHistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-solid-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-line-outline border-l bg-components-fill-standard-primary">
        <div className="flex items-center justify-between border-line-divider border-b px-spacing-600 py-spacing-500">
          <div>
            <h2 className="font-bold text-content-standard-primary text-heading">최근 이력</h2>
            <p className="text-content-standard-tertiary text-label">최근 50건</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-radius-200 p-spacing-200 transition-all duration-150 hover:bg-core-accent-translucent hover:text-core-accent">
            <X className="size-5 text-content-standard-tertiary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-spacing-900">
              <div className="mb-spacing-300 size-8 animate-spin rounded-full border-2 border-core-accent border-t-transparent" />
              <span className="text-content-standard-tertiary text-label">로딩중...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-spacing-900">
              <div className="mb-spacing-300 flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
                <History className="size-6 text-core-accent" />
              </div>
              <span className="text-content-standard-tertiary text-label">이력이 없습니다.</span>
            </div>
          ) : (
            <div className="divide-y divide-line-divider">
              {history.map((item) => {
                const createdAt = new Date(item.created_at);
                const dateStr = createdAt.toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                });
                const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

                return (
                  <div
                    key={item.id}
                    className="px-spacing-600 py-spacing-400 transition-colors hover:bg-components-fill-standard-secondary">
                    <div className="mb-spacing-200 flex items-start justify-between gap-spacing-300">
                      <div className="min-w-0 flex-1">
                        <div className="mb-spacing-50 flex items-center gap-spacing-200">
                          <span className="font-semibold text-body text-content-standard-primary">
                            {item.retake.student.name}
                          </span>
                          <span
                            className={`shrink-0 rounded-radius-200 px-spacing-200 py-spacing-50 font-semibold text-footnote ${getActionBadgeStyle(item.action_type)}`}>
                            {getActionLabel(item.action_type)}
                          </span>
                        </div>
                        <div className="truncate text-content-standard-secondary text-label">
                          {item.retake.exam.course.name} · {item.retake.exam.name} {item.retake.exam.exam_number}
                          회차
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-content-standard-tertiary text-footnote">{dateStr}</div>
                        <div className="text-content-standard-quaternary text-footnote">{timeStr}</div>
                        {item.performed_by && (
                          <div className="text-content-standard-quaternary text-footnote">{item.performed_by.name}</div>
                        )}
                      </div>
                    </div>

                    {item.action_type === "assign" && (
                      <div className="flex items-center gap-spacing-200 rounded-radius-200 bg-solid-translucent-purple px-spacing-300 py-spacing-200">
                        <span className="text-footnote text-solid-purple">
                          {item.new_date ? `예정일: ${item.new_date}` : "예정일 미지정"}
                        </span>
                      </div>
                    )}

                    {(item.action_type === "postpone" ||
                      item.action_type === "date_edit" ||
                      item.action_type === "complete") &&
                      item.new_date && (
                        <div className="flex items-center gap-spacing-200 rounded-radius-200 bg-components-fill-standard-secondary px-spacing-300 py-spacing-200">
                          <span className="text-content-standard-tertiary text-footnote">
                            {item.previous_date || "미지정"}
                          </span>
                          <span className="text-content-standard-quaternary text-footnote">→</span>
                          <span className="font-medium text-content-standard-primary text-footnote">
                            {item.new_date}
                          </span>
                        </div>
                      )}

                    {item.action_type === "management_status_change" && item.new_management_status && (
                      <div className="flex items-center gap-spacing-200 rounded-radius-200 bg-solid-translucent-yellow px-spacing-300 py-spacing-200">
                        <span className="text-footnote text-solid-yellow">
                          {item.previous_management_status} → {item.new_management_status}
                        </span>
                      </div>
                    )}

                    {item.note && (
                      <div className="mt-spacing-200 truncate rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-300 py-spacing-200 text-content-standard-secondary text-footnote italic">
                        "{item.note}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
