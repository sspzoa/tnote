"use client";

import { useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
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

  const getMenuItems = (assignment: Assignment): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(assignment), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(assignment), variant: "danger" },
  ];

  const columns: DataTableColumn<Assignment, AssignmentSortKey>[] = [
    {
      id: "name",
      header: "과제명",
      sortKey: "name",
      cell: (assignment) => <span className="font-medium text-foreground">{assignment.name}</span>,
    },
    {
      id: "createdAt",
      header: "생성일",
      sortKey: "createdAt",
      cell: (assignment) => (
        <span className="text-muted-foreground">{formatLocaleDateKorean(assignment.created_at)}</span>
      ),
    },
    {
      id: "manage",
      header: "관리",
      cell: (assignment) => (
        <Button size="xs" className="font-medium" onClick={() => onManage(assignment)}>
          학생별 현황
        </Button>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (assignment) => <DropdownMenu items={getMenuItems(assignment)} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={assignments}
      getRowId={(assignment) => assignment.id}
      comparators={comparators}
      defaultSort={{ key: "createdAt", direction: "asc" }}
    />
  );
}
