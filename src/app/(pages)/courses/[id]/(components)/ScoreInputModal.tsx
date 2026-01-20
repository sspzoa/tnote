"use client";

import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListLoading,
  type StudentListStudent,
} from "@/shared/components/ui/studentList";
import type { Exam } from "../(hooks)/useExams";

interface ScoreInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  students: StudentListStudent[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  scoreInputs: Record<string, string>;
  onScoreChange: (studentId: string, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  belowCutlineCount: number;
}

export function ScoreInputModal({
  isOpen,
  onClose,
  exam,
  students,
  isLoading,
  searchQuery,
  onSearchChange,
  scoreInputs,
  onScoreChange,
  onSave,
  isSaving,
  belowCutlineCount,
}: ScoreInputModalProps) {
  if (!exam) return null;

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const inputCount = Object.values(scoreInputs).filter((v) => v !== "" && !Number.isNaN(Number.parseInt(v))).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="점수 입력"
      subtitle={`${exam.name} (${exam.exam_number}회차) - 만점: ${exam.max_score || 8}점, 커트라인: ${exam.cutline || 4}점`}
      footer={
        !isLoading && students.length > 0 ? (
          <div className="w-full">
            <div className="mb-spacing-300 flex items-center justify-between text-body">
              <span className="text-content-standard-secondary">
                입력된 점수: {inputCount}명 / {students.length}명
              </span>
              {belowCutlineCount > 0 && (
                <span className="text-core-status-negative">커트라인 미달: {belowCutlineCount}명</span>
              )}
            </div>
            <div className="flex gap-spacing-300">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                취소
              </Button>
              <Button
                variant="primary"
                onClick={onSave}
                isLoading={isSaving}
                loadingText="저장 중..."
                className="flex-1">
                저장
              </Button>
            </div>
          </div>
        ) : undefined
      }>
      {isLoading ? (
        <StudentListContainer>
          <StudentListLoading />
        </StudentListContainer>
      ) : students.length === 0 ? (
        <StudentListContainer>
          <StudentListEmpty message="수강생이 없습니다." />
        </StudentListContainer>
      ) : (
        <>
          <div className="mb-spacing-400">
            <SearchInput
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="학생 검색..."
            />
          </div>

          <StudentListContainer>
            {filteredStudents.length === 0 ? (
              <StudentListEmpty message="검색 결과가 없습니다." />
            ) : (
              filteredStudents.map((student) => {
                const scoreValue = scoreInputs[student.id] || "";
                const score = Number.parseInt(scoreValue);
                const isBelowCutline = !Number.isNaN(score) && score < (exam.cutline || 4);

                return (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    highlighted={isBelowCutline}
                    rightContent={
                      <div className="flex items-center gap-spacing-200">
                        <input
                          type="number"
                          value={scoreValue}
                          onChange={(e) => onScoreChange(student.id, e.target.value)}
                          placeholder="-"
                          min="0"
                          max={exam.max_score || 8}
                          className={`w-20 rounded-radius-300 border px-spacing-300 py-spacing-200 text-center text-body transition-all focus:outline-none focus:ring-2 ${
                            isBelowCutline
                              ? "border-core-status-negative bg-solid-translucent-red text-core-status-negative focus:ring-core-status-negative/30"
                              : "border-line-outline bg-components-fill-standard-primary text-content-standard-primary focus:border-core-accent focus:ring-core-accent-translucent"
                          }`}
                        />
                        <span className="text-body text-content-standard-tertiary">/ {exam.max_score || 8}</span>
                      </div>
                    }
                  />
                );
              })
            )}
          </StudentListContainer>
        </>
      )}
    </Modal>
  );
}
