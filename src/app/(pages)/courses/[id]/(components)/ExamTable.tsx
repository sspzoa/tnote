"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, type DropdownMenuItem, MoreOptionsButton } from "@/shared/components/ui/dropdownMenu";
import type { Exam } from "../(hooks)/useExams";

interface ExamTableProps {
  exams: Exam[];
  onScoreInput: (exam: Exam) => void;
  onAssignment: (exam: Exam) => void;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

export function ExamTable({ exams, onScoreInput, onAssignment, onEdit, onDelete }: ExamTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getMenuItems = (exam: Exam): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(exam), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(exam), variant: "danger" },
  ];

  return (
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              시험명
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              회차
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              만점
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              커트라인
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              최고점
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              평균
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              중앙값
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              재시험자
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              관리
            </th>
            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line-divider">
          {exams.map((exam) => (
            <tr key={exam.id} className="transition-colors hover:bg-core-accent-translucent/50">
              <td className="px-spacing-500 py-spacing-400">
                <div className="font-medium text-body text-content-standard-primary">{exam.name}</div>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                  {exam.exam_number}회차
                </span>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-primary">{exam.max_score || 8}점</span>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-primary">{exam.cutline || 4}점</span>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                {exam.highest_score !== null && exam.highest_score !== undefined ? (
                  <span className="text-body text-content-standard-primary">{exam.highest_score}점</span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="px-spacing-500 py-spacing-400">
                {exam.average_score !== null && exam.average_score !== undefined ? (
                  <span className="text-body text-content-standard-primary">{exam.average_score}점</span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="px-spacing-500 py-spacing-400">
                {exam.median_score !== null && exam.median_score !== undefined ? (
                  <span className="text-body text-content-standard-primary">{exam.median_score}점</span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="px-spacing-500 py-spacing-400">
                {exam.below_cutline_count !== null && exam.below_cutline_count !== undefined ? (
                  <span className="text-body text-content-standard-primary">
                    {exam.below_cutline_count}명 / {exam.total_score_count}명
                  </span>
                ) : (
                  <span className="text-body text-content-standard-tertiary">-</span>
                )}
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <div className="flex gap-spacing-200">
                  <Button size="sm" onClick={() => onScoreInput(exam)}>
                    점수 입력
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onAssignment(exam)}>
                    과제
                  </Button>
                </div>
              </td>
              <td className="relative px-spacing-500 py-spacing-400">
                <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === exam.id ? null : exam.id)} />
                <DropdownMenu
                  isOpen={openMenuId === exam.id}
                  onClose={() => setOpenMenuId(null)}
                  items={getMenuItems(exam)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
