"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormSelect } from "@/shared/components/ui/formSelect";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListLoading,
} from "@/shared/components/ui/studentList";
import { showAssignModalAtom } from "../(atoms)/useModalStore";
import { useCoursesForAssign } from "../(hooks)/useCoursesForAssign";
import { useExamsForAssign } from "../(hooks)/useExamsForAssign";
import { useRetakeAssign } from "../(hooks)/useRetakeAssign";
import { useStudentsForAssign } from "../(hooks)/useStudentsForAssign";

interface RetakeAssignModalProps {
  onSuccess?: () => void;
}

interface ExamScore {
  student_id: string;
  score: number;
}

export default function RetakeAssignModal({ onSuccess }: RetakeAssignModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAssignModalAtom);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [examScores, setExamScores] = useState<ExamScore[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const { courses, isLoading: coursesLoading } = useCoursesForAssign();
  const { exams, isLoading: examsLoading } = useExamsForAssign(selectedCourseId || null);
  const { students, isLoading: studentsLoading } = useStudentsForAssign(selectedCourseId || null);
  const { assignRetake, isAssigning } = useRetakeAssign();

  // 선택된 시험 정보
  const selectedExam = exams.find((e) => e.id === selectedExamId);

  // 시험 선택 시 점수 불러오기
  useEffect(() => {
    const fetchScores = async () => {
      if (!selectedExamId) {
        setExamScores([]);
        return;
      }

      setLoadingScores(true);
      try {
        const response = await fetch(`/api/exams/${selectedExamId}/scores`);
        const result = await response.json();
        if (response.ok && result.data) {
          setExamScores(result.data.scores || []);
        }
      } catch {
        // 점수 불러오기 실패 시 무시
      } finally {
        setLoadingScores(false);
      }
    };

    fetchScores();
  }, [selectedExamId]);

  // 학생별 점수 조회
  const getStudentScore = (studentId: string): number | null => {
    const score = examScores.find((s) => s.student_id === studentId);
    return score ? score.score : null;
  };

  // 커트라인 미달 학생인지 확인
  const isBelowCutline = (studentId: string): boolean => {
    const score = getStudentScore(studentId);
    if (score === null || !selectedExam) return false;
    return score < (selectedExam.cutline || 4);
  };

  // 커트라인 미달 학생 목록
  const studentsBelowCutline = students.filter((s) => isBelowCutline(s.id));

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCourseId("");
    setSelectedExamId("");
    setSelectedStudentIds([]);
    setScheduledDate("");
    setSearchQuery("");
    setExamScores([]);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedExamId("");
    setSelectedStudentIds([]);
    setExamScores([]);
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  // 재시험자(커트라인 미달) 전체 선택
  const handleSelectBelowCutline = () => {
    const filteredBelowCutline = studentsBelowCutline.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const allSelected =
      filteredBelowCutline.length > 0 && filteredBelowCutline.every((s) => selectedStudentIds.includes(s.id));

    if (allSelected) {
      // 재시험자만 해제
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredBelowCutline.some((s) => s.id === id)));
    } else {
      // 재시험자 전체 선택 (기존 선택 유지하면서 추가)
      const newIds = filteredBelowCutline.map((s) => s.id);
      setSelectedStudentIds((prev) => [...new Set([...prev, ...newIds])]);
    }
  };

  const handleAssign = async () => {
    if (!selectedExamId || selectedStudentIds.length === 0) {
      alert("모든 필수 항목을 입력해 주세요.");
      return;
    }

    try {
      await assignRetake({
        examId: selectedExamId,
        studentIds: selectedStudentIds,
        scheduledDate: scheduledDate || null,
      });
      alert(`${selectedStudentIds.length}명의 재시험이 배정되었습니다.`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "재시험 배정에 실패했습니다.");
    }
  };

  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const courseOptions = [
    { value: "", label: "과목을 선택하세요" },
    ...courses.map((course) => ({ value: course.id, label: course.name })),
  ];

  const examOptions = [
    { value: "", label: "시험을 선택하세요" },
    ...exams.map((exam) => ({ value: exam.id, label: `${exam.name} ${exam.exam_number}회차` })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="재시험 배정"
      maxWidth="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedExamId || selectedStudentIds.length === 0 || isAssigning}
            className="flex-1">
            {isAssigning ? "배정 중..." : "배정하기"}
          </Button>
        </>
      }>
      <div className="space-y-spacing-500">
        <FormSelect
          label="과목 선택"
          required
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          disabled={coursesLoading}
          options={courseOptions}
        />

        {selectedCourseId && (
          <FormSelect
            label="시험 선택"
            required
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            disabled={examsLoading}
            options={examOptions}
          />
        )}

        <FormInput
          label="예정일 (선택)"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
        />

        {selectedCourseId && (
          <div>
            <div className="mb-spacing-200 flex items-center justify-between">
              <label className="font-semibold text-body text-content-standard-primary">
                학생 선택 <span className="text-core-status-negative">*</span>
                {selectedExam && examScores.length > 0 && (
                  <span className="ml-spacing-200 font-normal text-content-standard-tertiary text-footnote">
                    (커트라인: {selectedExam.cutline || 4}점)
                  </span>
                )}
              </label>
              <div className="flex gap-spacing-300">
                {selectedExamId && examScores.length > 0 && studentsBelowCutline.length > 0 && (
                  <button
                    onClick={handleSelectBelowCutline}
                    className="text-body text-core-status-negative hover:underline"
                    disabled={studentsLoading || loadingScores}>
                    {studentsBelowCutline.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .length > 0 &&
                    studentsBelowCutline
                      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .every((s) => selectedStudentIds.includes(s.id))
                      ? "재시험자 해제"
                      : `재시험자 전체 선택 (${studentsBelowCutline.length}명)`}
                  </button>
                )}
                <button
                  onClick={handleSelectAll}
                  className="text-body text-core-accent hover:underline"
                  disabled={studentsLoading || filteredStudents.length === 0}>
                  {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                    ? "전체 해제"
                    : "전체 선택"}
                </button>
              </div>
            </div>

            <SearchInput
              placeholder="학생 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-spacing-300"
            />

            <StudentListContainer>
              {studentsLoading || loadingScores ? (
                <StudentListLoading />
              ) : filteredStudents.length === 0 ? (
                <StudentListEmpty message={students.length === 0 ? "수강생이 없습니다." : "검색 결과가 없습니다."} />
              ) : (
                filteredStudents.map((student) => {
                  const score = getStudentScore(student.id);
                  const belowCutline = isBelowCutline(student.id);

                  return (
                    <StudentListItem
                      key={student.id}
                      student={student}
                      selected={selectedStudentIds.includes(student.id)}
                      onToggle={() => handleStudentToggle(student.id)}
                      highlighted={belowCutline}
                      badge={
                        belowCutline && (
                          <span className="rounded-radius-200 bg-solid-translucent-red px-spacing-200 py-spacing-50 text-core-status-negative text-footnote">
                            재시험 대상
                          </span>
                        )
                      }
                      extraInfo={
                        score !== null &&
                        selectedExam && (
                          <span className={belowCutline ? "text-core-status-negative" : ""}>
                            {" "}
                            · {score}/{selectedExam.max_score || 8}점
                          </span>
                        )
                      }
                    />
                  );
                })
              )}
            </StudentListContainer>

            {selectedStudentIds.length > 0 && (
              <div className="mt-spacing-200 text-body text-content-standard-secondary">
                선택된 학생: {selectedStudentIds.length}명
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
