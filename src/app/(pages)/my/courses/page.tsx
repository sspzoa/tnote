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
import { parseDatePrefix } from "@/shared/lib/utils/sort";
import type { MyExamScore } from "./(hooks)/useMyCourses";
import { useMyCourses } from "./(hooks)/useMyCourses";

const PercentileChart = ({ scores }: { scores: MyExamScore[] }) => {
  const chartData = useMemo(
    () =>
      [...scores]
        .sort((a, b) => parseDatePrefix(a.exam.name) - parseDatePrefix(b.exam.name))
        .map((s) => ({
          name: `${s.exam.course.name} ${s.exam.examNumber}회`,
          label: `${s.exam.examNumber}회`,
          percentile: Math.round((1 - s.rank / s.totalStudents) * 100),
          rank: s.rank,
          total: s.totalStudents,
          examName: s.exam.name,
          courseName: s.exam.course.name,
        })),
    [scores],
  );

  if (chartData.length < 2) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base text-foreground">백분위 추이</span>
        <span className="text-muted-foreground text-xs">높을수록 좋음</span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickLine={false}
              tickFormatter={(_v: any, i: number) => chartData[i]?.label ?? _v}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(_v: any, _n: any, props: any) => {
                const d = props.payload;
                return [`${d.percentile}% (${d.rank}/${d.total}등)`, "백분위"];
              }}
              labelFormatter={(_label: any, payload: any) => {
                if (payload && payload.length > 0) {
                  return `${_label} - ${payload[0].payload.examName}`;
                }
                return _label;
              }}
            />
            <Line
              type="monotone"
              dataKey="percentile"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 2, stroke: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

type ScoreSortKey = "exam" | "score" | "rank" | "average" | "median" | "highest";

export default function MyCoursesPage() {
  const { courses, examScores, isLoading, error } = useMyCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  const filteredScores = useMemo(
    () => examScores.filter((s) => selectedCourseId === "all" || s.exam.course.id === selectedCourseId),
    [examScores, selectedCourseId],
  );

  const comparators = useMemo(
    () => ({
      exam: (a: MyExamScore, b: MyExamScore) => parseDatePrefix(a.exam.name) - parseDatePrefix(b.exam.name),
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
          title="시험 현황"
          subtitle="나의 수업과 시험 현황을 확인합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title="시험 현황"
        subtitle={`수강 중인 수업 ${courses.length}개`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-52 w-full rounded-lg" />
          <SkeletonTable rows={5} columns={["w-24", "w-14", "w-14", "w-14", "w-14", "w-14", "w-14"]} />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState message="수강 중인 수업이 없습니다." />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <span className="font-medium text-muted-foreground text-sm">필터</span>
            <div className="flex flex-wrap items-center gap-3">
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

          <PercentileChart scores={filteredScores} />

          {sortedData.length === 0 ? (
            <EmptyState message="시험 기록이 없습니다." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full">
                <thead className="bg-muted">
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
                    <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">
                      결과
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((score) => {
                    const passed = score.cutline != null && score.score >= score.cutline;
                    const failed = score.cutline != null && score.score < score.cutline;
                    return (
                      <tr key={score.id} className="border-border border-t transition-colors hover:bg-accent">
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="text-base text-foreground">{score.exam.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {score.exam.course.name} {score.exam.examNumber}회차
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-medium text-base text-foreground">
                            {score.score}
                            {score.maxScore != null && <span className="text-muted-foreground">/{score.maxScore}</span>}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-base text-foreground">
                            {score.rank}
                            <span className="text-muted-foreground">/{score.totalStudents}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-base text-foreground">{score.average}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-base text-foreground">{score.median}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-base text-foreground">{score.highest}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
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
                          {score.cutline == null && <span className="text-muted-foreground text-xs">-</span>}
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
