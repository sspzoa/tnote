"use client";

import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
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

  const getMenuItems = (exam: Exam): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(exam), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(exam), variant: "danger" },
  ];

  const columns: DataTableColumn<Exam, ExamSortKey>[] = [
    {
      id: "name",
      header: "시험명",
      sortKey: "name",
      cell: (exam) => <span className="font-medium text-foreground">{exam.name}</span>,
    },
    {
      id: "examNumber",
      header: "회차",
      sortKey: "examNumber",
      cell: (exam) => (
        <Badge variant="blue" size="sm">
          {exam.exam_number}회차
        </Badge>
      ),
    },
    {
      id: "maxScore",
      header: "만점",
      sortKey: "maxScore",
      cell: (exam) => <span className="text-foreground">{exam.max_score || 8}점</span>,
    },
    {
      id: "cutline",
      header: "커트라인",
      sortKey: "cutline",
      cell: (exam) => <span className="text-foreground">{exam.cutline || 4}점</span>,
    },
    {
      id: "highest",
      header: "최고점",
      sortKey: "highest",
      cell: (exam) =>
        exam.highest_score !== null && exam.highest_score !== undefined ? (
          <span className="text-foreground">{exam.highest_score}점</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "average",
      header: "평균",
      sortKey: "average",
      cell: (exam) =>
        exam.average_score !== null && exam.average_score !== undefined ? (
          <span className="text-foreground">{exam.average_score}점</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "median",
      header: "중앙값",
      sortKey: "median",
      cell: (exam) =>
        exam.median_score !== null && exam.median_score !== undefined ? (
          <span className="text-foreground">{exam.median_score}점</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "retakers",
      header: "재시험자",
      sortKey: "retakers",
      cell: (exam) =>
        exam.below_cutline_count !== null && exam.below_cutline_count !== undefined ? (
          <span className="text-foreground">
            {exam.below_cutline_count}명 / {exam.total_score_count}명
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "manage",
      header: "관리",
      cell: (exam) => (
        <Button size="xs" className="font-medium" onClick={() => onManage(exam)}>
          점수 입력
        </Button>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (exam) => <DropdownMenu items={getMenuItems(exam)} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={exams}
      getRowId={(exam) => exam.id}
      comparators={comparators}
      defaultSort={{ key: "examNumber", direction: "asc" }}
    />
  );
}
