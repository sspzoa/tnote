"use client";

import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import type { Exam } from "../(hooks)/useExams";

interface ExamTableProps {
  exams: Exam[];
  onManage: (exam: Exam) => void;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

type ExamSortKey = "name" | "examNumber" | "maxScore" | "cutline" | "highest" | "average" | "median" | "retakers";

export function ExamTable({ exams, onManage, onEdit, onDelete }: ExamTableProps) {
  const comparators = useMemo(
    () => ({
      name: (a: Exam, b: Exam) => a.name.localeCompare(b.name, "ko"),
      examNumber: (a: Exam, b: Exam) => a.exam_number - b.exam_number,
      maxScore: (a: Exam, b: Exam) => (a.max_score || 8) - (b.max_score || 8),
      cutline: (a: Exam, b: Exam) => (a.cutline || 4) - (b.cutline || 4),
      highest: (a: Exam, b: Exam) => (a.highest_score ?? -1) - (b.highest_score ?? -1),
      average: (a: Exam, b: Exam) => (a.average_score ?? -1) - (b.average_score ?? -1),
      median: (a: Exam, b: Exam) => (a.median_score ?? -1) - (b.median_score ?? -1),
      retakers: (a: Exam, b: Exam) => (a.below_cutline_count ?? -1) - (b.below_cutline_count ?? -1),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<Exam, ExamSortKey>({
    data: exams,
    comparators,
    defaultSort: { key: "examNumber", direction: "asc" },
  });

  const getMenuItems = (exam: Exam): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(exam), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(exam), variant: "danger" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full rounded-lg">
        <thead className="bg-muted">
          <tr>
            <SortableHeader
              label="시험명"
              sortKey="name"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="회차"
              sortKey="examNumber"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="만점"
              sortKey="maxScore"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="커트라인"
              sortKey="cutline"
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
              label="재시험자"
              sortKey="retakers"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">관리</th>
            <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.map((exam) => (
            <tr key={exam.id} className="transition-colors hover:bg-primary/10">
              <td className="whitespace-nowrap px-5 py-4">
                <div className="font-medium text-base text-foreground">{exam.name}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <Badge variant="blue" size="sm">
                  {exam.exam_number}회차
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-foreground">{exam.max_score || 8}점</span>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-foreground">{exam.cutline || 4}점</span>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                {exam.highest_score !== null && exam.highest_score !== undefined ? (
                  <span className="text-base text-foreground">{exam.highest_score}점</span>
                ) : (
                  <span className="text-base text-muted-foreground">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                {exam.average_score !== null && exam.average_score !== undefined ? (
                  <span className="text-base text-foreground">{exam.average_score}점</span>
                ) : (
                  <span className="text-base text-muted-foreground">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                {exam.median_score !== null && exam.median_score !== undefined ? (
                  <span className="text-base text-foreground">{exam.median_score}점</span>
                ) : (
                  <span className="text-base text-muted-foreground">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                {exam.below_cutline_count !== null && exam.below_cutline_count !== undefined ? (
                  <span className="text-base text-foreground">
                    {exam.below_cutline_count}명 / {exam.total_score_count}명
                  </span>
                ) : (
                  <span className="text-base text-muted-foreground">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <Button size="xs" className="font-medium" onClick={() => onManage(exam)}>
                  점수 입력
                </Button>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <DropdownMenu items={getMenuItems(exam)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
