"use client";

import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { parseDatePrefix } from "@/shared/lib/utils/sort";
import { type MyAssignment, useMyAssignments } from "./(hooks)/useMyAssignments";

const submissionStatusConfig: Record<string, { variant: "success" | "warning" | "danger" | "info"; label: string }> = {
  완료: { variant: "success", label: "완료" },
  미흡: { variant: "danger", label: "미흡" },
  미제출: { variant: "danger", label: "미제출" },
  결석: { variant: "danger", label: "결석" },
  검사예정: { variant: "warning", label: "검사예정" },
};

type SortKey = "assignment" | "course" | "status";

export default function MyAssignmentsPage() {
  const { assignments, isLoading, error } = useMyAssignments();

  const comparators = useMemo(
    () => ({
      assignment: (a: MyAssignment, b: MyAssignment) =>
        parseDatePrefix(a.assignment.name) - parseDatePrefix(b.assignment.name),
      course: (a: MyAssignment, b: MyAssignment) => a.assignment.course.name.localeCompare(b.assignment.course.name),
      status: (a: MyAssignment, b: MyAssignment) => a.status.localeCompare(b.status),
    }),
    [],
  );

  const columns: DataTableColumn<MyAssignment, SortKey>[] = [
    {
      id: "assignment",
      header: "과제명",
      sortKey: "assignment",
      cell: (item) => <span className="text-foreground">{item.assignment.name}</span>,
    },
    {
      id: "course",
      header: "수업",
      sortKey: "course",
      cell: (item) => <span className="text-muted-foreground">{item.assignment.course.name}</span>,
    },
    {
      id: "status",
      header: "상태",
      sortKey: "status",
      cell: (item) => {
        const statusCfg = submissionStatusConfig[item.status] || {
          variant: "warning" as const,
          label: item.status,
        };
        return (
          <Badge variant={statusCfg.variant} size="sm">
            {statusCfg.label}
          </Badge>
        );
      },
    },
  ];

  if (error) {
    return (
      <Container>
        <Header
          title="과제 현황"
          subtitle="나의 과제 현황을 확인합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={(error as Error).message} />
      </Container>
    );
  }

  const incompleteCount = assignments.filter((a) => a.status !== "완료").length;

  return (
    <Container>
      <Header
        title="과제 현황"
        subtitle={`전체 ${assignments.length}개 (미완료 ${incompleteCount}개)`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      {isLoading ? (
        <SkeletonTable rows={5} columns={["w-24", "w-20", "w-14"]} />
      ) : assignments.length === 0 ? (
        <EmptyState message="과제 기록이 없습니다." />
      ) : (
        <DataTable
          columns={columns}
          data={assignments}
          getRowId={(item) => item.id}
          comparators={comparators}
          defaultSort={{ key: "assignment", direction: "desc" }}
        />
      )}
    </Container>
  );
}
