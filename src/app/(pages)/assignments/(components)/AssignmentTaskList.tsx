"use client";

import { ClipboardList } from "lucide-react";
import { type ReactNode, useCallback, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import { isTagActive } from "@/shared/lib/utils/tags";
import type { AssignmentTask } from "@/shared/types";

interface AssignmentTaskListProps {
  tasks: AssignmentTask[];
  isLoading?: boolean;
  empty?: ReactNode;
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
  isLoading,
  empty,
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

  const columns: DataTableColumn<AssignmentTask, TaskSortKey>[] = [
    {
      id: "student",
      header: "학생",
      sortKey: "student",
      cell: (task) => {
        const activeTags = (task.student.tags || []).filter((assignment) =>
          isTagActive(assignment.start_date, assignment.end_date),
        );
        return (
          <button
            type="button"
            onClick={() => onViewStudent(task.student.id)}
            className="group flex items-center gap-3 text-left">
            <IconBadge icon={ClipboardList} tone="assignments" size="sm" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                {task.student.name}
              </span>
              {activeTags.length > 0 ? (
                <div className="flex flex-nowrap gap-1">
                  {activeTags.map((assignment) => (
                    <Badge key={assignment.id} variant={assignment.tag?.color ?? "neutral"} size="xs">
                      {assignment.tag?.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">{task.student.school}</span>
              )}
            </div>
          </button>
        );
      },
    },
    {
      id: "assignment",
      header: "과제",
      sortKey: "assignment",
      cell: (task) => (
        <>
          <span className="text-foreground">{task.assignment.name}</span>
          <div className="text-muted-foreground text-xs">{task.assignment.course.name}</div>
        </>
      ),
    },
    {
      id: "scheduledDate",
      header: "예정일",
      sortKey: "scheduledDate",
      cell: (task) => (
        <div className="flex flex-col gap-1">
          <div className="text-foreground">{task.current_scheduled_date || "-"}</div>
          {task.postpone_count > 0 && (
            <div className="flex gap-2">
              <span className="text-muted-foreground text-xs">연기 {task.postpone_count}회</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "상태",
      sortKey: "status",
      cell: (task) => getStatusBadge(task.status),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (task) => <DropdownMenu items={getMenuItems(task)} />,
    },
  ];

  return (
    <DataTable
      flush
      isLoading={isLoading}
      skeletonRows={8}
      empty={empty}
      columns={columns}
      data={tasks}
      getRowId={(task) => task.id}
      comparators={comparators}
      defaultSort={{ key: "scheduledDate", direction: "asc" }}
    />
  );
}
