"use client";

import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { useMyAssignments } from "./(hooks)/useMyAssignments";

const submissionStatusConfig: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
  완료: { variant: "success", label: "완료" },
  미흡: { variant: "warning", label: "미흡" },
  미제출: { variant: "danger", label: "미제출" },
};

export default function MyAssignmentsPage() {
  const { assignments, isLoading, error } = useMyAssignments();

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
        <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
          <table className="w-full rounded-radius-400">
            <thead className="bg-components-fill-standard-secondary">
              <tr>
                <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                  과제명
                </th>
                <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                  수업
                </th>
                <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => {
                const statusCfg = submissionStatusConfig[item.status] || {
                  variant: "warning" as const,
                  label: item.status,
                };
                return (
                  <tr
                    key={item.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-primary">
                      {item.assignment.name}
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                      {item.assignment.course.name}
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      <Badge variant={statusCfg.variant} size="sm">
                        {statusCfg.label}
                      </Badge>
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
