"use client";

import { History } from "lucide-react";
import { Badge, type BadgeVariant, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";

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

const getActionBadgeVariant = (actionType: string): BadgeVariant => {
  if (actionType === "assign") return "purple";
  if (actionType === "postpone") return "blue";
  if (actionType === "absent") return "red";
  if (actionType === "complete") return "green";
  if (actionType === "status_change") return "purple";
  if (actionType === "management_status_change") return "yellow";
  if (actionType === "date_edit") return "blue";
  return "neutral";
};

export default function RetakeHistoryPanel({ isOpen, onClose, history, isLoading }: RetakeHistoryPanelProps) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="최근 이력" subtitle="최근 50건">
      {isLoading ? (
        <SkeletonSpinner className="py-spacing-900" size="md" />
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
                <div className="mb-spacing-200 flex items-center justify-between gap-spacing-200">
                  <div className="flex items-center gap-spacing-200">
                    <span className="font-semibold text-body text-content-standard-primary">
                      {item.retake.student.name}
                    </span>
                    <Badge variant={getActionBadgeVariant(item.action_type)} size="xs">
                      {getActionLabel(item.action_type)}
                    </Badge>
                  </div>
                  <span className="shrink-0 text-content-standard-tertiary text-footnote">
                    {dateStr} {timeStr}
                    {item.performed_by && ` · ${item.performed_by.name}`}
                  </span>
                </div>
                <div className="mb-spacing-200 truncate text-content-standard-secondary text-label">
                  {item.retake.exam.course.name} · {item.retake.exam.name} {item.retake.exam.exam_number}회차
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
                      <span className="font-medium text-content-standard-primary text-footnote">{item.new_date}</span>
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
    </SlidePanel>
  );
}
