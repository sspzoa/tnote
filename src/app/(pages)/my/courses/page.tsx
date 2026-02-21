"use client";

import { useMemo, useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { useMyCourses } from "./(hooks)/useMyCourses";

const assignmentStatusConfig: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
  완료: { variant: "success", label: "완료" },
  미흡: { variant: "warning", label: "미흡" },
  미제출: { variant: "danger", label: "미제출" },
};

export default function MyCoursesPage() {
  const { courses, examScores, assignmentMap, isLoading, error } = useMyCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  const sortedScores = useMemo(
    () =>
      [...examScores]
        .filter((s) => selectedCourseId === "all" || s.exam.course.id === selectedCourseId)
        .sort((a, b) => b.exam.examNumber - a.exam.examNumber),
    [examScores, selectedCourseId],
  );

  if (error) {
    return (
      <Container>
        <Header
          title="시험 및 과제 현황"
          subtitle="나의 수업과 과제 현황을 확인합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title="시험 및 과제 현황"
        subtitle={`수강 중인 수업 ${courses.length}개`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      {isLoading ? (
        <div className="flex flex-col gap-spacing-400">
          <SkeletonTable rows={5} columns={["w-24", "w-14", "w-14", "w-14", "w-14", "w-14", "w-14", "w-14"]} />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState message="수강 중인 수업이 없습니다." />
      ) : (
        <div className="flex flex-col gap-spacing-400">
          <div className="flex flex-col gap-spacing-400 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
            <span className="font-medium text-content-standard-tertiary text-label">필터</span>
            <div className="flex flex-wrap items-center gap-spacing-300">
              <FilterButton active={selectedCourseId === "all"} onClick={() => setSelectedCourseId("all")}>
                전체
              </FilterButton>
              {courses.map((course) => (
                <FilterButton
                  key={course.id}
                  active={selectedCourseId === course.id}
                  onClick={() => setSelectedCourseId(course.id)}>
                  {course.name}
                </FilterButton>
              ))}
            </div>
          </div>

          {sortedScores.length === 0 ? (
            <EmptyState message="시험 및 과제 기록이 없습니다." />
          ) : (
            <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
              <table className="w-full">
                <thead className="bg-components-fill-standard-secondary">
                  <tr>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      시험
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      내 점수
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      등수
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      평균
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      중앙값
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      최고점
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      결과
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      과제
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScores.map((score) => {
                    const passed = score.cutline != null && score.score >= score.cutline;
                    const failed = score.cutline != null && score.score < score.cutline;
                    const assignmentStatus = assignmentMap[score.exam.id];
                    const assignment = assignmentStatus ? assignmentStatusConfig[assignmentStatus] : null;
                    return (
                      <tr
                        key={score.id}
                        className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          <div className="text-body text-content-standard-primary">{score.exam.name}</div>
                          <div className="text-content-standard-secondary text-footnote">
                            {score.exam.course.name} {score.exam.examNumber}회차
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          <span className="font-medium text-body text-content-standard-primary">
                            {score.score}
                            {score.maxScore != null && (
                              <span className="text-content-standard-tertiary">/{score.maxScore}</span>
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          <span className="text-body text-content-standard-primary">
                            {score.rank}
                            <span className="text-content-standard-tertiary">/{score.totalStudents}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          <span className="text-body text-content-standard-primary">{score.average}</span>
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          <span className="text-body text-content-standard-primary">{score.median}</span>
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          <span className="text-body text-content-standard-primary">{score.highest}</span>
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          {passed && (
                            <Badge variant="success" size="sm">
                              통과
                            </Badge>
                          )}
                          {failed && (
                            <Badge variant="danger" size="sm">
                              재시험
                            </Badge>
                          )}
                          {score.cutline == null && (
                            <span className="text-content-standard-tertiary text-footnote">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                          {assignment ? (
                            <Badge variant={assignment.variant} size="sm">
                              {assignment.label}
                            </Badge>
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
        </div>
      )}
    </Container>
  );
}
