"use client";

import { useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { formatLocaleDateKorean } from "@/shared/lib/utils/date";
import type { Assignment } from "../(hooks)/useAssignments";

interface AssignmentTableProps {
  assignments: Assignment[];
  onManage: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

type AssignmentSortKey = "name" | "createdAt";

export function AssignmentTable({ assignments, onManage, onEdit, onDelete }: AssignmentTableProps) {
  const comparators = useMemo(
    () => ({
      name: (a: Assignment, b: Assignment) => a.name.localeCompare(b.name, "ko"),
      createdAt: (a: Assignment, b: Assignment) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<Assignment, AssignmentSortKey>({
    data: assignments,
    comparators,
    defaultSort: { key: "createdAt", direction: "asc" },
  });

  const getMenuItems = (assignment: Assignment): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(assignment), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(assignment), variant: "danger" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full rounded-lg">
        <thead className="bg-muted">
          <tr>
            <SortableHeader
              label="과제명"
              sortKey="name"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="생성일"
              sortKey="createdAt"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">관리</th>
            <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.map((assignment) => (
            <tr key={assignment.id} className="transition-colors hover:bg-primary/10">
              <td className="whitespace-nowrap px-5 py-4">
                <div className="font-medium text-base text-foreground">{assignment.name}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-muted-foreground">{formatLocaleDateKorean(assignment.created_at)}</span>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <Button size="xs" className="font-medium" onClick={() => onManage(assignment)}>
                  학생별 현황
                </Button>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <DropdownMenu items={getMenuItems(assignment)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
