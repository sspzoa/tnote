"use client";

import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import type { MyRetake } from "./(hooks)/useMyRetakes";
import { useMyRetakes } from "./(hooks)/useMyRetakes";

const statusConfig: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
  pending: { variant: "warning", label: "대기중" },
  completed: { variant: "success", label: "완료" },
  absent: { variant: "danger", label: "결석" },
};

const STATUS_ORDER: Record<string, number> = { pending: 0, absent: 1, completed: 2 };

type RetakeSortKey = "exam" | "scheduledDate" | "status";

export default function MyRetakesPage() {
  const { retakes, isLoading, error } = useMyRetakes();

  const comparators = useMemo(
    () => ({
      exam: (a: MyRetake, b: MyRetake) => a.exam.examNumber - b.exam.examNumber,
      scheduledDate: (a: MyRetake, b: MyRetake) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""),
      status: (a: MyRetake, b: MyRetake) => (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1),
    }),
    [],
  );

  const columns: DataTableColumn<MyRetake, RetakeSortKey>[] = [
    {
      id: "exam",
      header: "시험",
      sortKey: "exam",
      cell: (retake) => (
        <div>
          <div className="text-foreground">{retake.exam.name}</div>
          <div className="text-muted-foreground text-xs">
            {retake.exam.course.name} {retake.exam.examNumber}회차
          </div>
        </div>
      ),
    },
    {
      id: "scheduledDate",
      header: "예정일",
      sortKey: "scheduledDate",
      cell: (retake) => <span className="text-foreground">{retake.scheduledDate || "-"}</span>,
    },
    {
      id: "status",
      header: "상태",
      sortKey: "status",
      cell: (retake) => {
        const status = statusConfig[retake.status] || { variant: "neutral" as const, label: retake.status };
        return (
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        );
      },
    },
    {
      id: "note",
      header: "비고",
      cell: (retake) => (
        <div className="flex gap-2">
          {retake.postponeCount > 0 && (
            <span className="text-muted-foreground text-xs">연기 {retake.postponeCount}회</span>
          )}
          {retake.absentCount > 0 && <span className="text-muted-foreground text-xs">결석 {retake.absentCount}회</span>}
          {retake.postponeCount === 0 && retake.absentCount === 0 && (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Container>
        <Header
          title="재시험 현황"
          subtitle="나의 재시험 현황을 확인합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  const pendingCount = retakes.filter((r) => r.status === "pending").length;

  return (
    <Container>
      <Header
        title="재시험 현황"
        subtitle={`전체 ${retakes.length}건 (대기 ${pendingCount}건)`}
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
      ) : retakes.length === 0 ? (
        <EmptyState message="재시험이 없습니다." />
      ) : (
        <DataTable
          columns={columns}
          data={retakes}
          getRowId={(retake) => retake.id}
          comparators={comparators}
          defaultSort={{ key: "exam", direction: "desc" }}
        />
      )}
    </Container>
  );
}
