"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Modal, SearchInput } from "@/shared/components/ui";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
  type StudentListStudent,
} from "@/shared/components/ui/studentList";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils/cn";
import { getErrorMessage } from "@/shared/lib/utils/error";
import type { Exam } from "../(hooks)/useExams";
import { useRetakeAssignFromExam } from "../(hooks)/useRetakeAssign";

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
  onSave: (scores: Array<{ studentId: string; score: number }>, toDeleteScores: string[]) => Promise<void>;
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
  const toast = useToast();
  const { assignRetakes, isPending: isAssigning } = useRetakeAssignFromExam();

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
    const toDeleteScores = existingScoreStudentIds.filter((id) => !scoreStudentIds.includes(id));

    const maxScoreValue = exam.max_score || 8;
    const invalidScores = scores.filter((s) => s.score > maxScoreValue);
    if (invalidScores.length > 0) {
      toast.info(`만점(${maxScoreValue}점)을 초과하는 점수가 있습니다.`);
      return;
    }

    await onSave(scores, toDeleteScores);
  };

  const handleRetakeAssign = async () => {
    if (!exam) return;

    const belowCutlineStudentIds = Object.entries(scoreInputs)
      .filter(([, value]) => {
        const score = Number.parseInt(value);
        return !Number.isNaN(score) && score < (exam.cutline || 4);
      })
      .map(([studentId]) => studentId);

    if (belowCutlineStudentIds.length === 0) return;

    try {
      await assignRetakes({ examId: exam.id, studentIds: belowCutlineStudentIds });
      toast.success(`${belowCutlineStudentIds.length}명의 학생에게 재시험을 할당했습니다.`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("이미")) {
        toast.info("이미 재시험이 할당된 학생이 있습니다.");
      } else {
        toast.error(getErrorMessage(error, "재시험 할당에 실패했습니다."));
      }
    }
  };

  if (!exam) return null;

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const scoreCount = Object.values(scoreInputs).filter((v) => v !== "" && !Number.isNaN(Number.parseInt(v))).length;
  const maxScoreValue = exam.max_score || 8;
  const cutlineValue = exam.cutline || 4;
  const belowCutlineCount = Object.entries(scoreInputs).filter(([, value]) => {
    const score = Number.parseInt(value);
    return !Number.isNaN(score) && score < cutlineValue;
  }).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSave}
      title="점수 입력"
      subtitle={`${exam.name} (${exam.exam_number}회차) - 만점: ${exam.max_score || 8}점, 커트라인: ${exam.cutline || 4}점`}
      footer={
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">점수: {scoreCount}명</span>
            {belowCutlineCount > 0 && <span className="text-destructive">커트라인 미달: {belowCutlineCount}명</span>}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || students.length === 0}
              isLoading={isSaving}
              loadingText="저장 중..."
              className="flex-1">
              저장
            </Button>
            <Button
              variant="secondary"
              onClick={handleRetakeAssign}
              disabled={belowCutlineCount === 0 || isSaving || isAssigning}
              isLoading={isAssigning}
              loadingText="할당 중..."
              className="flex-1">
              재시험자 할당 {belowCutlineCount > 0 && `(${belowCutlineCount}명)`}
            </Button>
          </div>
        </div>
      }>
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-9 animate-pulse rounded-lg bg-muted/50" />
          <StudentListContainer>
            <StudentListSkeleton count={6} showCheckbox={false} showRightContent />
          </StudentListContainer>
        </div>
      ) : students.length === 0 ? (
        <StudentListContainer>
          <StudentListEmpty message="수강생이 없습니다." />
        </StudentListContainer>
      ) : (
        <div className="flex flex-col gap-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 검색..."
          />

          <StudentListContainer>
            {/* Sticky cutline + tally header so the reference stays visible while scrolling a long roster. */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-border border-b bg-card/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  만점 <span className="font-semibold text-foreground tabular-nums">{maxScoreValue}</span>
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="text-muted-foreground">
                  커트라인 <span className="font-semibold text-foreground tabular-nums">{cutlineValue}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="xs">
                  점수 <span className="ml-0.5 font-semibold tabular-nums">{scoreCount}</span>명
                </Badge>
                {belowCutlineCount > 0 && (
                  <Badge variant="danger" size="xs">
                    커트라인 미달 <span className="ml-0.5 font-semibold tabular-nums">{belowCutlineCount}</span>명
                  </Badge>
                )}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <StudentListEmpty message="검색 결과가 없습니다." />
            ) : (
              filteredStudents.map((student) => {
                const scoreValue = scoreInputs[student.id] || "";
                const score = Number.parseInt(scoreValue);
                const isBelowCutline = !Number.isNaN(score) && score < cutlineValue;

                return (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    highlighted={isBelowCutline}
                    rightContent={
                      <div className="flex items-center gap-2.5">
                        {isBelowCutline && (
                          <Badge variant="danger" size="xs">
                            미달
                          </Badge>
                        )}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={scoreValue}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            placeholder="-"
                            min="0"
                            max={maxScoreValue}
                            aria-label={`${student.name} 점수`}
                            className={cn(
                              "h-9 w-16 rounded-lg border text-center text-sm tabular-nums outline-none transition-[color,box-shadow,background-color] duration-[--motion-fast] focus-visible:ring-[3px]",
                              isBelowCutline
                                ? "border-destructive/40 bg-destructive-soft text-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
                                : "border-input bg-muted/50 text-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-ring/50",
                            )}
                          />
                          <span className="text-muted-foreground text-xs tabular-nums">/ {maxScoreValue}</span>
                        </div>
                      </div>
                    }
                  />
                );
              })
            )}
          </StudentListContainer>
        </div>
      )}
    </Modal>
  );
}
