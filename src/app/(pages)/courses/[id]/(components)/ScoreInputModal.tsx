"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
  type StudentListStudent,
} from "@/shared/components/ui/studentList";
import type { Exam } from "../(hooks)/useExams";

interface ScoreData {
  student_id: string;
  score: number;
}

interface ExistingAssignment {
  student: { id: string };
  status: string;
}

interface ScoreInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  students: StudentListStudent[];
  isLoading: boolean;
  existingScores: ScoreData[];
  existingAssignments: ExistingAssignment[];
  onSave: (
    scores: Array<{ studentId: string; score: number }>,
    toDeleteScores: string[],
    assignments: Array<{ studentId: string; status: string }>,
  ) => Promise<void>;
  isSaving: boolean;
}

export function ScoreInputModal({
  isOpen,
  onClose,
  exam,
  students,
  isLoading,
  existingScores,
  existingAssignments,
  onSave,
  isSaving,
}: ScoreInputModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [assignmentInputs, setAssignmentInputs] = useState<Record<string, string>>({});
  const [existingScoreStudentIds, setExistingScoreStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (existingScores.length > 0) {
        setExistingScoreStudentIds(existingScores.map((s) => s.student_id));
        const initialScores: Record<string, string> = {};
        for (const score of existingScores) {
          initialScores[score.student_id] = score.score.toString();
        }
        setScoreInputs(initialScores);
      } else {
        setExistingScoreStudentIds([]);
        setScoreInputs({});
      }

      if (existingAssignments.length > 0) {
        const initialAssignments: Record<string, string> = {};
        for (const assignment of existingAssignments) {
          initialAssignments[assignment.student.id] = assignment.status;
        }
        setAssignmentInputs(initialAssignments);
      } else {
        setAssignmentInputs({});
      }
    }
  }, [isOpen, existingScores, existingAssignments]);

  const handleClose = () => {
    setSearchQuery("");
    setScoreInputs({});
    setAssignmentInputs({});
    setExistingScoreStudentIds([]);
    onClose();
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setScoreInputs((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleAssignmentChange = (studentId: string, status: string) => {
    setAssignmentInputs((prev) => {
      if (status === "") {
        const newInputs = { ...prev };
        delete newInputs[studentId];
        return newInputs;
      }
      return { ...prev, [studentId]: status };
    });
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
    const toDeleteScores = existingScoreStudentIds.filter((id) => !scoreStudentIds.includes(id));

    const assignments = Object.entries(assignmentInputs)
      .filter(([, status]) => status !== "")
      .map(([studentId, status]) => ({ studentId, status }));

    const maxScoreValue = exam.max_score || 8;
    const invalidScores = scores.filter((s) => s.score > maxScoreValue);
    if (invalidScores.length > 0) {
      alert(`만점(${maxScoreValue}점)을 초과하는 점수가 있습니다.`);
      return;
    }

    await onSave(scores, toDeleteScores, assignments);
  };

  if (!exam) return null;

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const scoreCount = Object.values(scoreInputs).filter((v) => v !== "" && !Number.isNaN(Number.parseInt(v))).length;
  const cutlineValue = exam.cutline || 4;
  const belowCutlineCount = Object.entries(scoreInputs).filter(([, value]) => {
    const score = Number.parseInt(value);
    return !Number.isNaN(score) && score < cutlineValue;
  }).length;

  const assignmentCount = Object.values(assignmentInputs).filter((v) => v !== "").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="점수 및 과제 입력"
      subtitle={`${exam.name} (${exam.exam_number}회차) - 만점: ${exam.max_score || 8}점, 커트라인: ${exam.cutline || 4}점`}
      footer={
        <div className="w-full">
          <div className="mb-spacing-300 flex flex-wrap items-center justify-between gap-spacing-200 text-body">
            <span className="text-content-standard-secondary">
              점수: {scoreCount}명 / 과제: {assignmentCount}명
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
              disabled={isLoading || students.length === 0}
              isLoading={isSaving}
              loadingText="저장 중..."
              className="flex-1">
              저장
            </Button>
          </div>
        </div>
      }>
      {isLoading ? (
        <>
          <div className="mb-spacing-400">
            <div className="h-12 animate-pulse rounded-radius-300 bg-components-fill-standard-secondary" />
          </div>
          <StudentListContainer>
            <StudentListSkeleton count={6} showCheckbox={false} showRightContent />
          </StudentListContainer>
        </>
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
                const currentAssignment = assignmentInputs[student.id] || "";

                return (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    highlighted={isBelowCutline}
                    rightContent={
                      <div className="flex flex-wrap items-center gap-spacing-300">
                        <div className="flex items-center gap-spacing-200">
                          <input
                            type="number"
                            value={scoreValue}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            placeholder="-"
                            min="0"
                            max={exam.max_score || 8}
                            className={`w-16 rounded-radius-300 border px-spacing-200 py-spacing-200 text-center text-body transition-all focus:outline-none focus:ring-2 ${
                              isBelowCutline
                                ? "border-core-status-negative bg-solid-translucent-red text-core-status-negative focus:ring-core-status-negative/30"
                                : "border-line-outline bg-components-fill-standard-primary text-content-standard-primary focus:border-core-accent focus:ring-core-accent-translucent"
                            }`}
                          />
                          <span className="text-footnote text-content-standard-tertiary">/ {exam.max_score || 8}</span>
                        </div>
                        <div className="h-6 w-px bg-line-divider" />
                        <select
                          value={currentAssignment}
                          onChange={(e) => handleAssignmentChange(student.id, e.target.value)}
                          className="w-20 rounded-radius-300 border border-line-outline bg-components-fill-standard-primary px-spacing-200 py-spacing-200 text-center text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
                          <option value="">-</option>
                          <option value="완료">완료</option>
                          <option value="미흡">미흡</option>
                          <option value="미제출">미제출</option>
                        </select>
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
