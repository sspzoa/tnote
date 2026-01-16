"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
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

  return (
    <div className="overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full">
        <thead className="border-line-divider border-b bg-components-fill-standard-secondary">
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
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === exam.id ? null : exam.id)}
                  className="rounded-radius-200 px-spacing-200 py-spacing-200 transition-all duration-150 hover:bg-core-accent-translucent hover:text-core-accent">
                  <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {openMenuId === exam.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] overflow-hidden rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-100">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(exam);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-all duration-150 hover:bg-core-accent-translucent hover:text-core-accent">
                        수정
                      </button>
                      <div className="my-spacing-100 border-line-divider border-t" />
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(exam);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-all duration-150 hover:bg-solid-translucent-red">
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
