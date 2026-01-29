"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import type { Exam } from "../(hooks)/useExams";

interface ExamTableProps {
  exams: Exam[];
  onScoreInput: (exam: Exam) => void;
  onAssignment: (exam: Exam) => void;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

type ExamSortKey = "name" | "examNumber" | "maxScore" | "cutline" | "highest" | "average" | "median" | "retakers";

export function ExamTable({ exams, onScoreInput, onAssignment, onEdit, onDelete }: ExamTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

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
    <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
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
            <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              관리
            </th>
            <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line-divider">
          {sortedData.map((exam) => (
            <tr key={exam.id} className="transition-colors hover:bg-core-accent-translucent/50">
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="font-medium text-body text-content-standard-primary">{exam.name}</div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                  {exam.exam_number}회차
                </span>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-primary">{exam.max_score || 8}점</span>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-primary">{exam.cutline || 4}점</span>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                {exam.highest_score !== null && exam.highest_score !== undefined ? (
                  <span className="text-body text-content-standard-primary">{exam.highest_score}점</span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                {exam.average_score !== null && exam.average_score !== undefined ? (
                  <span className="text-body text-content-standard-primary">{exam.average_score}점</span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                {exam.median_score !== null && exam.median_score !== undefined ? (
                  <span className="text-body text-content-standard-primary">{exam.median_score}점</span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                {exam.below_cutline_count !== null && exam.below_cutline_count !== undefined ? (
                  <span className="text-body text-content-standard-primary">
                    {exam.below_cutline_count}명 / {exam.total_score_count}명
                  </span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="flex gap-spacing-200">
                  <Button size="sm" onClick={() => onScoreInput(exam)}>
                    점수 입력
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onAssignment(exam)}>
                    과제
                  </Button>
                </div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <MoreOptionsButton
                  onClick={(pos) => {
                    if (openMenuId === exam.id) {
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    } else {
                      setOpenMenuId(exam.id);
                      setMenuPosition(pos);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openMenuId && (
        <DropdownMenu
          isOpen={true}
          onClose={() => {
            setOpenMenuId(null);
            setMenuPosition(null);
          }}
          items={getMenuItems(sortedData.find((e) => e.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
