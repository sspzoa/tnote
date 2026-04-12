"use client";

import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { isTagActive } from "@/shared/lib/utils/tags";
import type { AssignmentTask } from "@/shared/types";
import { openMenuIdAtom } from "../(atoms)/useAssignmentTaskStore";

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

const OPEN_STATUSES: ReadonlyArray<AssignmentTask["status"]> = ["pending", "absent"];

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
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const getMenuItems = useCallback(
    (task: AssignmentTask): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];
      const isOpen = (OPEN_STATUSES as readonly string[]).includes(task.status);

      if (isOpen) {
        items.push({ label: "완료", onClick: () => onComplete(task) });
        items.push({ label: "미흡", onClick: () => onMarkInsufficient(task) });
        items.push({ label: "미제출", onClick: () => onMarkNotSubmitted(task) });
        if (task.status !== "absent") {
          items.push({ label: "결석", onClick: () => onMarkAbsent(task) });
        }
        items.push({ label: "연기", onClick: () => onPostpone(task), dividerAfter: true });
      }

      items.push({ label: "이력 보기", onClick: () => onViewHistory(task) });

      if (isOpen) {
        items.push({ label: "수정", onClick: () => onEditDate(task), dividerAfter: true });
      } else {
        items[items.length - 1].dividerAfter = true;
      }

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
    <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
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
            <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((task) => (
            <tr
              key={task.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <button
                  onClick={() => onViewStudent(task.student.id)}
                  className="flex items-center gap-spacing-200 text-left transition-colors hover:text-core-accent">
                  <span className="font-medium text-body text-content-standard-primary hover:text-core-accent">
                    {task.student.name}
                  </span>
                  {(() => {
                    const activeTags = (task.student.tags || []).filter((assignment) =>
                      isTagActive(assignment.start_date, assignment.end_date),
                    );
                    if (activeTags.length === 0) return null;
                    return (
                      <div className="flex flex-nowrap gap-spacing-100">
                        {activeTags.map((assignment) => (
                          <Badge key={assignment.id} variant={assignment.tag?.color ?? "neutral"} size="xs">
                            {assignment.tag?.name}
                          </Badge>
                        ))}
                      </div>
                    );
                  })()}
                </button>
                <div className="text-content-standard-secondary text-footnote">{task.student.school}</div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-primary">{task.assignment.name}</span>
                <div className="text-content-standard-secondary text-footnote">{task.assignment.course.name}</div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="flex flex-col gap-spacing-100">
                  <div className="text-body text-content-standard-primary">{task.current_scheduled_date || "-"}</div>
                  {task.postpone_count > 0 && (
                    <div className="flex gap-spacing-200">
                      <span className="text-content-standard-tertiary text-footnote">연기 {task.postpone_count}회</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">{getStatusBadge(task.status)}</td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <MoreOptionsButton
                  onClick={(pos) => {
                    if (openMenuId === task.id) {
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    } else {
                      setOpenMenuId(task.id);
                      setMenuPosition(pos);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openMenuId && (
        <DropdownMenu
          isOpen={true}
          onClose={() => {
            setOpenMenuId(null);
            setMenuPosition(null);
          }}
          items={getMenuItems(sortedData.find((t) => t.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
