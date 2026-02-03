"use client";

import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { StatusBadge } from "@/shared/components/ui/statusBadge";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { TAG_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
import type { StatusColor, TagColor } from "@/shared/types";
import { openMenuIdAtom, type Retake } from "../(atoms)/useRetakesStore";

const isTagActive = (startDate: string, endDate: string | null): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return false;
  if (endDate === null) return true;

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return today <= end;
};

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
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
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
      exam: (a: Retake, b: Retake) => a.exam.name.localeCompare(b.exam.name, "ko"),
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
    const styles = {
      pending: "bg-solid-translucent-yellow text-core-status-warning",
      completed: "bg-solid-translucent-green text-core-status-positive",
      absent: "bg-solid-translucent-red text-core-status-negative",
    };
    const labels = {
      pending: "대기중",
      completed: "완료",
      absent: "결석",
    };
    return (
      <span
        className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getManagementStatusBadge = (status: string) => {
    const statusItem = managementStatuses.find((s) => s.name === status);
    const color = (statusItem?.color ?? "neutral") as StatusColor;

    return <StatusBadge variant={color}>{status}</StatusBadge>;
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
            <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((retake) => (
            <tr
              key={retake.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <button
                  onClick={() => onViewStudent(retake.student.id)}
                  className="flex items-center gap-spacing-200 text-left transition-colors hover:text-core-accent">
                  <span className="font-medium text-body text-content-standard-primary hover:text-core-accent">
                    {retake.student.name}
                  </span>
                  {(() => {
                    const activeTags = (retake.student.tags || []).filter((assignment) =>
                      isTagActive(assignment.start_date, assignment.end_date),
                    );
                    if (activeTags.length === 0) return null;
                    return (
                      <div className="flex flex-nowrap gap-spacing-100">
                        {activeTags.map((assignment) => {
                          const colorClasses = TAG_COLOR_CLASSES[assignment.tag?.color as TagColor];
                          return (
                            <span
                              key={assignment.id}
                              className={`rounded-radius-200 px-spacing-150 py-spacing-50 text-caption ${colorClasses?.bg || "bg-solid-translucent-gray"} ${colorClasses?.text || "text-content-standard-secondary"}`}>
                              {assignment.tag?.name}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}
                </button>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="text-body text-content-standard-primary">{retake.exam.name}</div>
                <div className="text-content-standard-secondary text-footnote">
                  {retake.exam.course.name} {retake.exam.exam_number}회차
                </div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="text-body text-content-standard-primary">{retake.current_scheduled_date || "-"}</div>
                {(retake.postpone_count > 0 || retake.absent_count > 0) && (
                  <div className="mt-spacing-100 flex gap-spacing-200">
                    {retake.postpone_count > 0 && (
                      <span className="text-content-standard-tertiary text-footnote">
                        연기 {retake.postpone_count}회
                      </span>
                    )}
                    {retake.absent_count > 0 && (
                      <span className="text-content-standard-tertiary text-footnote">결석 {retake.absent_count}회</span>
                    )}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">{getStatusBadge(retake.status)}</td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <button
                  onClick={() => onManagementStatusChange(retake)}
                  className="transition-opacity hover:opacity-70">
                  {getManagementStatusBadge(retake.management_status)}
                </button>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <MoreOptionsButton
                  onClick={(pos) => {
                    if (openMenuId === retake.id) {
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    } else {
                      setOpenMenuId(retake.id);
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
          items={getMenuItems(sortedData.find((r) => r.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
