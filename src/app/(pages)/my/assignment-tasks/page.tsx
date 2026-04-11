"use client";

import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { type MyAssignmentTask, useMyAssignmentTasks } from "./(hooks)/useMyAssignmentTasks";

const statusConfig: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
  pending: { variant: "warning", label: "검사예정" },
  completed: { variant: "success", label: "완료" },
  insufficient: { variant: "danger", label: "미흡" },
  not_submitted: { variant: "danger", label: "미제출" },
  absent: { variant: "danger", label: "결석" },
};

type SortKey = "assignment" | "scheduledDate" | "status";

export default function MyAssignmentTasksPage() {
  const { tasks, isLoading, error } = useMyAssignmentTasks();

  const comparators = useMemo(
    () => ({
      assignment: (a: MyAssignmentTask, b: MyAssignmentTask) =>
        a.assignment.name.localeCompare(b.assignment.name, "ko"),
      scheduledDate: (a: MyAssignmentTask, b: MyAssignmentTask) =>
        (a.scheduledDate || "").localeCompare(b.scheduledDate || ""),
      status: (a: MyAssignmentTask, b: MyAssignmentTask) => {
        const order: Record<string, number> = {
          pending: 0,
          absent: 1,
          insufficient: 2,
          not_submitted: 3,
          completed: 4,
        };
        return (order[a.status] ?? 0) - (order[b.status] ?? 0);
      },
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<MyAssignmentTask, SortKey>({
    data: tasks,
    comparators,
    defaultSort: { key: "assignment", direction: "desc" },
  });

  if (error) {
    return (
      <Container>
        <Header
          title="재과제 현황"
          subtitle="나의 재과제 현황을 확인합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={(error as Error).message} />
      </Container>
    );
  }

  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <Container>
      <Header
        title="재과제 현황"
        subtitle={`전체 ${tasks.length}건 (미완료 ${pendingCount}건)`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      {isLoading ? (
        <SkeletonTable
          rows={5}
          columns={[
            { width: "w-24", stacked: ["w-24", "w-28"] },
            { width: "w-24" },
            { width: "w-14", rounded: true },
            { width: "w-20" },
          ]}
        />
      ) : sortedData.length === 0 ? (
        <EmptyState message="재과제가 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
          <table className="w-full rounded-radius-400">
            <thead className="bg-components-fill-standard-secondary">
              <tr>
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
                <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((task) => {
                const status = statusConfig[task.status] || { variant: "warning" as const, label: task.status };
                return (
                  <tr
                    key={task.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      <div className="text-body text-content-standard-primary">{task.assignment.name}</div>
                      <div className="text-content-standard-secondary text-footnote">{task.assignment.course.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      <span className="text-body text-content-standard-primary">{task.scheduledDate || "-"}</span>
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      {task.postponeCount > 0 ? (
                        <span className="text-content-standard-tertiary text-footnote">
                          연기 {task.postponeCount}회
                        </span>
                      ) : (
                        <span className="text-content-standard-tertiary text-footnote">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
