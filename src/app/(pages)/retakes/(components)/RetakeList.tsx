"use client";

import { useCallback, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { isTagActive } from "@/shared/lib/utils/tags";
import type { StatusColor } from "@/shared/types";
import type { Retake } from "../(atoms)/useRetakesStore";

interface RetakeListProps {
  retakes: Retake[];
  onViewStudent: (studentId: string) => void;
  onPostpone: (retake: Retake) => void;
  onAbsent: (retake: Retake) => void;
  onComplete: (retake: Retake) => void;
  onViewHistory: (retake: Retake) => void;
  onDelete: (retake: Retake) => void;
  onManagementStatusChange: (retake: Retake) => void;
  onEditDate: (retake: Retake) => void;
}

type RetakeSortKey = "student" | "exam" | "scheduledDate" | "status" | "managementStatus";

export default function RetakeList({
  retakes,
  onViewStudent,
  onPostpone,
  onAbsent,
  onComplete,
  onViewHistory,
  onDelete,
  onManagementStatusChange,
  onEditDate,
}: RetakeListProps) {
  const { statuses: managementStatuses } = useManagementStatuses();

  const getMenuItems = useCallback(
    (retake: Retake): DropdownMenuItem[] => {
      const items: DropdownMenuItem[] = [];

      if (retake.status !== "completed") {
        items.push({ label: "연기", onClick: () => onPostpone(retake) });
        if (retake.status === "pending") {
          items.push({ label: "결석", onClick: () => onAbsent(retake) });
        }
        items.push({ label: "완료", onClick: () => onComplete(retake), dividerAfter: true });
      }

      items.push({ label: "이력 보기", onClick: () => onViewHistory(retake) });

      if (retake.status !== "completed") {
        items.push({ label: "수정", onClick: () => onEditDate(retake), dividerAfter: true });
      } else {
        items[items.length - 1].dividerAfter = true;
      }

      items.push({ label: "삭제", onClick: () => onDelete(retake), variant: "danger" });

      return items;
    },
    [onPostpone, onAbsent, onComplete, onViewHistory, onEditDate, onDelete],
  );

  const comparators = useMemo(
    () => ({
      student: (a: Retake, b: Retake) => a.student.name.localeCompare(b.student.name, "ko"),
      exam: (a: Retake, b: Retake) =>
        `${a.exam.name} (${a.exam.exam_number}회차)`.localeCompare(`${b.exam.name} (${b.exam.exam_number}회차)`, "ko"),
      scheduledDate: (a: Retake, b: Retake) =>
        (a.current_scheduled_date || "").localeCompare(b.current_scheduled_date || ""),
      status: (a: Retake, b: Retake) => a.status.localeCompare(b.status),
      managementStatus: (a: Retake, b: Retake) => a.management_status.localeCompare(b.management_status),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<Retake, RetakeSortKey>({
    data: retakes,
    comparators,
    defaultSort: { key: "scheduledDate", direction: "asc" },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "warning" | "success" | "danger"> = {
      pending: "warning",
      completed: "success",
      absent: "danger",
    };
    const labels: Record<string, string> = {
      pending: "대기중",
      completed: "완료",
      absent: "결석",
    };
    return (
      <Badge variant={variants[status]} size="sm">
        {labels[status]}
      </Badge>
    );
  };

  const getManagementStatusBadge = (status: string) => {
    const statusItem = managementStatuses.find((s) => s.name === status);
    const color = (statusItem?.color ?? "neutral") as StatusColor;

    return <Badge variant={color}>{status}</Badge>;
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
              label="시험"
              sortKey="exam"
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
            <SortableHeader
              label="관리 상태"
              sortKey="managementStatus"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((retake) => (
            <tr key={retake.id} className="border-border border-t transition-colors hover:bg-accent">
              <td className="whitespace-nowrap px-5 py-4">
                <button
                  onClick={() => onViewStudent(retake.student.id)}
                  className="flex items-center gap-2 text-left transition-colors hover:text-primary">
                  <span className="font-medium text-base text-foreground hover:text-primary">
                    {retake.student.name}
                  </span>
                  {(() => {
                    const activeTags = (retake.student.tags || []).filter((assignment) =>
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
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-foreground">
                  {retake.exam.name} ({retake.exam.exam_number}회차)
                </span>
                <div className="text-muted-foreground text-xs">{retake.exam.course.name}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex flex-col gap-1">
                  <div className="text-base text-foreground">{retake.current_scheduled_date || "-"}</div>
                  {(retake.postpone_count > 0 || retake.absent_count > 0) && (
                    <div className="flex gap-2">
                      {retake.postpone_count > 0 && (
                        <span className="text-muted-foreground text-xs">연기 {retake.postpone_count}회</span>
                      )}
                      {retake.absent_count > 0 && (
                        <span className="text-muted-foreground text-xs">결석 {retake.absent_count}회</span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">{getStatusBadge(retake.status)}</td>
              <td className="whitespace-nowrap px-5 py-4">
                <button
                  onClick={() => onManagementStatusChange(retake)}
                  className="transition-opacity hover:opacity-70">
                  {getManagementStatusBadge(retake.management_status)}
                </button>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <DropdownMenu items={getMenuItems(retake)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
