"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterBar, FilterRow } from "@/shared/components/ui/toolbar";
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
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground text-sm">백분위 추이</span>
          <span className="text-muted-foreground text-xs">높을수록 좋음</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
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
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
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

  const columns: DataTableColumn<MyExamScore, ScoreSortKey>[] = [
    {
      id: "exam",
      header: "시험",
      sortKey: "exam",
      cell: (score) => (
        <div>
          <div className="text-foreground">{score.exam.name}</div>
          <div className="text-muted-foreground text-xs">
            {score.exam.course.name} {score.exam.examNumber}회차
          </div>
        </div>
      ),
    },
    {
      id: "score",
      header: "내 점수",
      sortKey: "score",
      numeric: true,
      cell: (score) => (
        <span className="font-medium text-foreground">
          {score.score}
          {score.maxScore != null && <span className="text-muted-foreground">/{score.maxScore}</span>}
        </span>
      ),
    },
    {
      id: "rank",
      header: "등수",
      sortKey: "rank",
      numeric: true,
      cell: (score) => (
        <span className="text-foreground">
          {score.rank}
          <span className="text-muted-foreground">/{score.totalStudents}</span>
        </span>
      ),
    },
    {
      id: "average",
      header: "평균",
      sortKey: "average",
      numeric: true,
      cell: (score) => <span className="text-foreground">{score.average}</span>,
    },
    {
      id: "median",
      header: "중앙값",
      sortKey: "median",
      numeric: true,
      cell: (score) => <span className="text-foreground">{score.median}</span>,
    },
    {
      id: "highest",
      header: "최고점",
      sortKey: "highest",
      numeric: true,
      cell: (score) => <span className="text-foreground">{score.highest}</span>,
    },
    {
      id: "result",
      header: "결과",
      cell: (score) => {
        const passed = score.cutline != null && score.score >= score.cutline;
        const failed = score.cutline != null && score.score < score.cutline;
        return (
          <>
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
          </>
        );
      },
    },
  ];

  if (error) {
    return (
      <PageShell title="시험 현황" subtitle="나의 수업과 시험 현황을 확인합니다" width="narrow">
        <ErrorComponent errorMessage={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell title="시험 현황" subtitle={`수강 중인 수업 ${courses.length}개`} width="narrow">
      {!isLoading && courses.length === 0 ? (
        <EmptyState message="수강 중인 수업이 없습니다." />
      ) : (
        <div className="flex flex-col gap-4">
          <FilterBar label="필터">
            <FilterRow>
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
            </FilterRow>
          </FilterBar>

          <PercentileChart scores={filteredScores} />

          <DataTable
            isLoading={isLoading}
            skeletonRows={8}
            empty={<EmptyState message="시험 기록이 없습니다." />}
            columns={columns}
            data={filteredScores}
            getRowId={(score) => score.id}
            comparators={comparators}
            defaultSort={{ key: "exam", direction: "desc" }}
          />
        </div>
      )}
    </PageShell>
  );
}
