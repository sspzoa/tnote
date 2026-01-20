"use client";

import { useEffect, useState } from "react";
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

interface ScoreData {
  student_id: string;
  score: number;
}

interface ScoreInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  students: StudentListStudent[];
  isLoading: boolean;
  existingScores: ScoreData[];
  onSave: (scores: Array<{ studentId: string; score: number }>, toDelete: string[]) => Promise<void>;
  isSaving: boolean;
}

export function ScoreInputModal({
  isOpen,
  onClose,
  exam,
  students,
  isLoading,
  existingScores,
  onSave,
  isSaving,
}: ScoreInputModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [existingScoreStudentIds, setExistingScoreStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && existingScores.length > 0) {
      setExistingScoreStudentIds(existingScores.map((s) => s.student_id));
      const initialScores: Record<string, string> = {};
      for (const score of existingScores) {
        initialScores[score.student_id] = score.score.toString();
      }
      setScoreInputs(initialScores);
    } else if (isOpen) {
      setExistingScoreStudentIds([]);
      setScoreInputs({});
    }
  }, [isOpen, existingScores]);

  const handleClose = () => {
    setSearchQuery("");
    setScoreInputs({});
    setExistingScoreStudentIds([]);
    onClose();
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setScoreInputs((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!exam) return;

    const scores = Object.entries(scoreInputs)
      .filter(([, value]) => value !== "" && !Number.isNaN(Number.parseInt(value)))
      .map(([studentId, value]) => ({
        studentId,
        score: Number.parseInt(value),
      }));

    const scoreStudentIds = scores.map((s) => s.studentId);
    const toDelete = existingScoreStudentIds.filter((id) => !scoreStudentIds.includes(id));

    if (scores.length === 0 && toDelete.length === 0) {
      alert("저장할 변경사항이 없습니다.");
      return;
    }

    const maxScoreValue = exam.max_score || 8;
    const invalidScores = scores.filter((s) => s.score > maxScoreValue);
    if (invalidScores.length > 0) {
      alert(`만점(${maxScoreValue}점)을 초과하는 점수가 있습니다.`);
      return;
    }

    await onSave(scores, toDelete);
  };

  if (!exam) return null;

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const inputCount = Object.values(scoreInputs).filter((v) => v !== "" && !Number.isNaN(Number.parseInt(v))).length;
  const cutlineValue = exam.cutline || 4;
  const belowCutlineCount = Object.entries(scoreInputs).filter(([, value]) => {
    const score = Number.parseInt(value);
    return !Number.isNaN(score) && score < cutlineValue;
  }).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
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
