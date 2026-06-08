"use client";

import { useCallback, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { isTagActive } from "@/shared/lib/utils/tags";
import type { AssignmentTask } from "@/shared/types";

interface AssignmentTaskListProps {
  tasks: AssignmentTask[];
  onViewStudent: (studentId: string) => void;
  onPostpone: (task: AssignmentTask) => void;
  onComplete: (task: AssignmentTask) => void;
  onMarkInsufficient: (task: AssignmentTask) => void;
  onMarkNotSubmitted: (task: AssignmentTask) => void;
  onMarkAbsent: (task: AssignmentTask) => void;
  onViewHistory: (task: AssignmentTask) => void;
  onDelete: (task: AssignmentTask) => void;
  onEditDate: (task: AssignmentTask) => void;
}

type TaskSortKey = "student" | "assignment" | "scheduledDate" | "status";

export default function AssignmentTaskList({
  tasks,
  onViewStudent,
  onPostpone,
  onComplete,
  onMarkInsufficient,
  onMarkNotSubmitted,
  onMarkAbsent,
  onViewHistory,
  onDelete,
  onEditDate,
}: AssignmentTaskListProps) {
  const getMenuItems = useCallback(
    (task: AssignmentTask): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (task.status !== "completed") {
        items.push({ label: "완료", onClick: () => onComplete(task) });
      }
      if (task.status !== "insufficient") {
        items.push({ label: "미흡", onClick: () => onMarkInsufficient(task) });
      }
      if (task.status !== "not_submitted") {
        items.push({ label: "미제출", onClick: () => onMarkNotSubmitted(task) });
      }
      if (task.status !== "absent") {
        items.push({ label: "결석", onClick: () => onMarkAbsent(task) });
      }
      items.push({ label: "연기", onClick: () => onPostpone(task), dividerAfter: true });

      items.push({ label: "이력 보기", onClick: () => onViewHistory(task) });
      items.push({ label: "수정", onClick: () => onEditDate(task), dividerAfter: true });

      items.push({ label: "삭제", onClick: () => onDelete(task), variant: "danger" });

      return items;
    },
    [onPostpone, onComplete, onMarkInsufficient, onMarkNotSubmitted, onMarkAbsent, onViewHistory, onEditDate, onDelete],
  );

  const comparators = useMemo(
    () => ({
      student: (a: AssignmentTask, b: AssignmentTask) => a.student.name.localeCompare(b.student.name, "ko"),
      assignment: (a: AssignmentTask, b: AssignmentTask) => a.assignment.name.localeCompare(b.assignment.name, "ko"),
      scheduledDate: (a: AssignmentTask, b: AssignmentTask) =>
        (a.current_scheduled_date || "").localeCompare(b.current_scheduled_date || ""),
      status: (a: AssignmentTask, b: AssignmentTask) => a.status.localeCompare(b.status),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<AssignmentTask, TaskSortKey>({
    data: tasks,
    comparators,
    defaultSort: { key: "scheduledDate", direction: "asc" },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "warning" | "success" | "danger" | "neutral"> = {
      pending: "warning",
      completed: "success",
      insufficient: "danger",
      not_submitted: "danger",
      absent: "danger",
    };
    const labels: Record<string, string> = {
      pending: "검사예정",
      completed: "완료",
      insufficient: "미흡",
      not_submitted: "미제출",
      absent: "결석",
    };
    return (
      <Badge variant={variants[status] ?? "neutral"} size="sm">
        {labels[status] ?? status}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full rounded-lg">
        <thead className="bg-muted">
          <tr>
            <SortableHeader
              label="학생"
              sortKey="student"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="과제"
              sortKey="assignment"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="예정일"
              sortKey="scheduledDate"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="상태"
              sortKey="status"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((task) => (
            <tr key={task.id} className="border-border border-t transition-colors hover:bg-accent">
              <td className="whitespace-nowrap px-5 py-4">
                <button
                  onClick={() => onViewStudent(task.student.id)}
                  className="flex items-center gap-2 text-left transition-colors hover:text-primary">
                  <span className="font-medium text-base text-foreground hover:text-primary">{task.student.name}</span>
                  {(() => {
                    const activeTags = (task.student.tags || []).filter((assignment) =>
                      isTagActive(assignment.start_date, assignment.end_date),
                    );
                    if (activeTags.length === 0) return null;
                    return (
                      <div className="flex flex-nowrap gap-1">
                        {activeTags.map((assignment) => (
                          <Badge key={assignment.id} variant={assignment.tag?.color ?? "neutral"} size="xs">
                            {assignment.tag?.name}
                          </Badge>
                        ))}
                      </div>
                    );
                  })()}
                </button>
                <div className="text-muted-foreground text-xs">{task.student.school}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-foreground">{task.assignment.name}</span>
                <div className="text-muted-foreground text-xs">{task.assignment.course.name}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex flex-col gap-1">
                  <div className="text-base text-foreground">{task.current_scheduled_date || "-"}</div>
                  {task.postpone_count > 0 && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground text-xs">연기 {task.postpone_count}회</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">{getStatusBadge(task.status)}</td>
              <td className="whitespace-nowrap px-5 py-4">
                <DropdownMenu items={getMenuItems(task)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
