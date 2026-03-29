"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import type { Assignment } from "../(hooks)/useAssignments";

interface AssignmentTableProps {
  assignments: Assignment[];
  onManage: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
}

type AssignmentSortKey = "name" | "createdAt";

export function AssignmentTable({ assignments, onManage, onEdit, onDelete }: AssignmentTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

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
    <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
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
            <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              관리
            </th>
            <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line-divider">
          {sortedData.map((assignment) => (
            <tr key={assignment.id} className="transition-colors hover:bg-core-accent-translucent/50">
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="font-medium text-body text-content-standard-primary">{assignment.name}</div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-secondary">
                  {new Date(assignment.created_at).toLocaleDateString("ko-KR")}
                </span>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <Button variant="primary" size="xs" className="font-medium" onClick={() => onManage(assignment)}>
                  제출 현황 입력
                </Button>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <MoreOptionsButton
                  onClick={(pos) => {
                    if (openMenuId === assignment.id) {
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    } else {
                      setOpenMenuId(assignment.id);
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
          items={getMenuItems(sortedData.find((a) => a.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
