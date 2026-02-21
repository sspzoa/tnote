"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { Skeleton, SkeletonTable } from "@/shared/components/ui/skeleton";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import type { MyExamScore } from "./(hooks)/useMyCourses";
import { useMyCourses } from "./(hooks)/useMyCourses";

const assignmentStatusConfig: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
  완료: { variant: "success", label: "완료" },
  미흡: { variant: "warning", label: "미흡" },
  미제출: { variant: "danger", label: "미제출" },
};

const formatRatio = (rank: number, total: number): string => {
  if (total === 0) return "-";
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(rank, total);
  return `${rank / d}/${total / d}`;
};

const RankRatioChart = ({ scores }: { scores: MyExamScore[] }) => {
  const chartData = useMemo(
    () =>
      [...scores]
        .sort((a, b) => a.exam.examNumber - b.exam.examNumber)
        .map((s) => ({
          name: `${s.exam.examNumber}회`,
          ratio: Math.round(((s.totalStudents - s.rank + 1) / s.totalStudents) * 100),
          label: formatRatio(s.rank, s.totalStudents),
          rank: s.rank,
          total: s.totalStudents,
          examName: s.exam.name,
          courseName: s.exam.course.name,
        })),
    [scores],
  );

  if (chartData.length < 2) return null;

  return (
    <div className="flex flex-col gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-body text-content-standard-primary">등수 비율 추이</span>
        <span className="text-content-standard-tertiary text-footnote">높을수록 좋음</span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-divider)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--content-standard-tertiary)" }} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "var(--content-standard-tertiary)" }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--components-fill-standard-primary)",
                border: "1px solid var(--line-outline)",
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(_v: any, _n: any, props: any) => {
                const d = props.payload;
                return [`${d.rank}/${d.total} (${d.label})`, "등수"];
              }}
              labelFormatter={(_label: any, payload: any) => {
                if (payload && payload.length > 0) {
                  return `${payload[0].payload.courseName} ${_label} - ${payload[0].payload.examName}`;
                }
                return _label;
              }}
            />
            <Line
              type="monotone"
              dataKey="ratio"
              stroke="var(--core-accent)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--core-accent)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--core-accent)", strokeWidth: 2, stroke: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

type ScoreSortKey = "exam" | "score" | "rank" | "average" | "median" | "highest";

export default function MyCoursesPage() {
  const { courses, examScores, assignmentMap, isLoading, error } = useMyCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  const filteredScores = useMemo(
    () => examScores.filter((s) => selectedCourseId === "all" || s.exam.course.id === selectedCourseId),
    [examScores, selectedCourseId],
  );

  const comparators = useMemo(
    () => ({
      exam: (a: MyExamScore, b: MyExamScore) => a.exam.examNumber - b.exam.examNumber,
      score: (a: MyExamScore, b: MyExamScore) => a.score - b.score,
      rank: (a: MyExamScore, b: MyExamScore) => a.rank - b.rank,
      average: (a: MyExamScore, b: MyExamScore) => a.average - b.average,
      median: (a: MyExamScore, b: MyExamScore) => a.median - b.median,
      highest: (a: MyExamScore, b: MyExamScore) => a.highest - b.highest,
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<MyExamScore, ScoreSortKey>({
    data: filteredScores,
    comparators,
    defaultSort: { key: "exam", direction: "desc" },
  });

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
          <Skeleton className="h-52 w-full rounded-radius-400" />
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

          <RankRatioChart scores={filteredScores} />

          {sortedData.length === 0 ? (
            <EmptyState message="시험 및 과제 기록이 없습니다." />
          ) : (
            <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
              <table className="w-full">
                <thead className="bg-components-fill-standard-secondary">
                  <tr>
                    <SortableHeader
                      label="시험"
                      sortKey="exam"
                      currentSortKey={sortState.key}
                      currentDirection={sortState.direction}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="내 점수"
                      sortKey="score"
                      currentSortKey={sortState.key}
                      currentDirection={sortState.direction}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="등수"
                      sortKey="rank"
                      currentSortKey={sortState.key}
                      currentDirection={sortState.direction}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="평균"
                      sortKey="average"
                      currentSortKey={sortState.key}
                      currentDirection={sortState.direction}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="중앙값"
                      sortKey="median"
                      currentSortKey={sortState.key}
                      currentDirection={sortState.direction}
                      onSort={toggleSort}
                    />
                    <SortableHeader
                      label="최고점"
                      sortKey="highest"
                      currentSortKey={sortState.key}
                      currentDirection={sortState.direction}
                      onSort={toggleSort}
                    />
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      결과
                    </th>
                    <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                      과제
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((score) => {
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
