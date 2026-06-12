"use client";

import { RefreshCw } from "lucide-react";
import { type ReactNode, useCallback, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import { isTagActive } from "@/shared/lib/utils/tags";
import type { StatusColor } from "@/shared/types";
import type { Retake } from "../(atoms)/useRetakesStore";

interface RetakeListProps {
  retakes: Retake[];
  isLoading?: boolean;
  empty?: ReactNode;
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
  isLoading,
  empty,
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

  const columns: DataTableColumn<Retake, RetakeSortKey>[] = [
    {
      id: "student",
      header: "학생",
      sortKey: "student",
      cell: (retake) => {
        const activeTags = (retake.student.tags || []).filter((assignment) =>
          isTagActive(assignment.start_date, assignment.end_date),
        );
        return (
          <button
            type="button"
            onClick={() => onViewStudent(retake.student.id)}
            className="group flex min-w-0 items-center gap-3 text-left">
            <IconBadge icon={RefreshCw} tone="retakes" size="sm" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                {retake.student.name}
              </span>
              {activeTags.length > 0 && (
                <div className="flex flex-nowrap gap-1">
                  {activeTags.map((assignment) => (
                    <Badge key={assignment.id} variant={assignment.tag?.color ?? "neutral"} size="xs">
                      {assignment.tag?.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </button>
        );
      },
    },
    {
      id: "exam",
      header: "시험",
      sortKey: "exam",
      cell: (retake) => (
        <div>
          <span className="text-foreground">
            {retake.exam.name} ({retake.exam.exam_number}회차)
          </span>
          <div className="text-muted-foreground text-xs">{retake.exam.course.name}</div>
        </div>
      ),
    },
    {
      id: "scheduledDate",
      header: "예정일",
      sortKey: "scheduledDate",
      cell: (retake) => (
        <div className="flex flex-col gap-1">
          <div className="text-foreground">{retake.current_scheduled_date || "-"}</div>
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
      ),
    },
    {
      id: "status",
      header: "상태",
      sortKey: "status",
      cell: (retake) => getStatusBadge(retake.status),
    },
    {
      id: "managementStatus",
      header: "관리 상태",
      sortKey: "managementStatus",
      cell: (retake) => (
        <button
          type="button"
          onClick={() => onManagementStatusChange(retake)}
          className="transition-opacity hover:opacity-70">
          {getManagementStatusBadge(retake.management_status)}
        </button>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (retake) => <DropdownMenu items={getMenuItems(retake)} />,
    },
  ];

  return (
    <DataTable
      flush
      isLoading={isLoading}
      skeletonRows={8}
      empty={empty}
      columns={columns}
      data={retakes}
      getRowId={(retake) => retake.id}
      comparators={comparators}
      defaultSort={{ key: "scheduledDate", direction: "asc" }}
    />
  );
}
