"use client";

import { History } from "lucide-react";
import { Badge, type BadgeVariant, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";
import { formatLocaleMonthDayKorean, formatLocaleTimeKorean } from "@/shared/lib/utils/date";
import type { AssignmentTaskHistoryItem } from "../(hooks)/useAllAssignmentTaskHistory";

interface AssignmentTaskHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: AssignmentTaskHistoryItem[];
  isLoading: boolean;
}

const getActionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    assign: "할당",
    postpone: "연기",
    complete: "완료",
    insufficient: "미흡",
    not_submitted: "미제출",
    absent: "결석",
    status_change: "상태 변경",
    note_update: "메모 수정",
    date_edit: "날짜 수정",
  };
  return labels[actionType] || actionType;
};

const getActionBadgeVariant = (actionType: string): BadgeVariant => {
  if (actionType === "assign") return "purple";
  if (actionType === "postpone") return "blue";
  if (actionType === "complete") return "green";
  if (actionType === "insufficient") return "red";
  if (actionType === "not_submitted") return "red";
  if (actionType === "absent") return "red";
  if (actionType === "status_change") return "purple";
  if (actionType === "date_edit") return "blue";
  return "neutral";
};

export default function AssignmentTaskHistoryPanel({
  isOpen,
  onClose,
  history,
  isLoading,
}: AssignmentTaskHistoryPanelProps) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="최근 이력" subtitle="최근 50건">
      {isLoading ? (
        <SkeletonSpinner className="py-16" size="md" />
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <History className="size-6 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">이력이 없습니다.</span>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {history.map((item) => {
            const createdAt = new Date(item.created_at);
            const dateStr = formatLocaleMonthDayKorean(createdAt);
            const timeStr = formatLocaleTimeKorean(createdAt);

            return (
              <div key={item.id} className="flex flex-col gap-2 px-7 py-4 transition-colors hover:bg-muted">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-foreground">{item.task.student.name}</span>
                    <Badge variant={getActionBadgeVariant(item.action_type)} size="xs">
                      {getActionLabel(item.action_type)}
                    </Badge>
                  </div>
                  <span className="shrink-0 text-muted-foreground text-xs">
                    {dateStr} {timeStr}
                    {item.performed_by && ` · ${item.performed_by.name}`}
                  </span>
                </div>
                <div className="truncate text-muted-foreground text-sm">
                  {item.task.assignment.course.name} · {item.task.assignment.name}
                </div>

                {item.action_type === "assign" && (
                  <div className="flex items-center gap-2 rounded-sm bg-solid-translucent-purple px-3 py-2">
                    <span className="text-xs text-solid-purple">
                      {item.new_date ? `예정일: ${item.new_date}` : "예정일 미지정"}
                    </span>
                  </div>
                )}

                {(item.action_type === "postpone" ||
                  item.action_type === "date_edit" ||
                  item.action_type === "complete") &&
                  item.new_date && (
                    <div className="flex items-center gap-2 rounded-sm bg-muted px-3 py-2">
                      <span className="text-muted-foreground text-xs">{item.previous_date || "미지정"}</span>
                      <span className="text-muted-foreground/60 text-xs">→</span>
                      <span className="font-medium text-foreground text-xs">{item.new_date}</span>
                    </div>
                  )}

                {item.note && (
                  <div className="truncate rounded-sm bg-muted px-3 py-2 text-muted-foreground text-xs italic">
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
