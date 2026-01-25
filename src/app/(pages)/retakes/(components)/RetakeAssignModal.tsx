"use client";

import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormSelect } from "@/shared/components/ui/formSelect";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
} from "@/shared/components/ui/studentList";
import { showAssignModalAtom } from "../(atoms)/useModalStore";
import { useCoursesForAssign } from "../(hooks)/useCoursesForAssign";
import { useExamScoresForAssign } from "../(hooks)/useExamScoresForAssign";
import { useExamsForAssign } from "../(hooks)/useExamsForAssign";
import { useRetakeAssign } from "../(hooks)/useRetakeAssign";
import { useStudentsForAssign } from "../(hooks)/useStudentsForAssign";

interface RetakeAssignModalProps {
  onSuccess?: () => void;
}

export default function RetakeAssignModal({ onSuccess }: RetakeAssignModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAssignModalAtom);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { courses, isLoading: coursesLoading } = useCoursesForAssign();
  const { exams, isLoading: examsLoading } = useExamsForAssign(selectedCourseId || null);
  const { students, isLoading: studentsLoading } = useStudentsForAssign(selectedCourseId || null);
  const { examScores, isLoading: scoresLoading } = useExamScoresForAssign(selectedExamId || null);
  const { assignRetake, isAssigning } = useRetakeAssign();

  const selectedExam = useMemo(() => exams.find((e) => e.id === selectedExamId), [exams, selectedExamId]);

  const getStudentScore = (studentId: string): number | null => {
    const score = examScores.find((s) => s.student_id === studentId);
    return score ? score.score : null;
  };

  const isBelowCutline = (studentId: string): boolean => {
    const score = getStudentScore(studentId);
    if (score === null || !selectedExam) return false;
    return score < (selectedExam.cutline || 4);
  };

  const studentsBelowCutline = useMemo(
    () => students.filter((s) => isBelowCutline(s.id)),
    [students, examScores, selectedExam],
  );

  const filteredStudents = useMemo(
    () =>
      students
        .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [students, searchQuery],
  );

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCourseId("");
    setSelectedExamId("");
    setSelectedStudentIds([]);
    setScheduledDate("");
    setSearchQuery("");
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedExamId("");
    setSelectedStudentIds([]);
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleSelectBelowCutline = () => {
    const filteredBelowCutline = studentsBelowCutline.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const allSelected =
      filteredBelowCutline.length > 0 && filteredBelowCutline.every((s) => selectedStudentIds.includes(s.id));

    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredBelowCutline.some((s) => s.id === id)));
    } else {
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

  const courseOptions = [
    { value: "", label: "수업을 선택하세요" },
    ...courses.map((course) => ({ value: course.id, label: course.name })),
  ];

  const examOptions = [
    { value: "", label: "시험을 선택하세요" },
    ...exams.map((exam) => ({ value: exam.id, label: `${exam.name} ${exam.exam_number}회차` })),
  ];

  const isDataLoading = studentsLoading || scoresLoading;
  const filteredBelowCutlineForButton = studentsBelowCutline.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const allBelowCutlineSelected =
    filteredBelowCutlineForButton.length > 0 &&
    filteredBelowCutlineForButton.every((s) => selectedStudentIds.includes(s.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="재시험 배정"
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
          label="수업 선택"
          required
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          disabled={coursesLoading}
          options={courseOptions}
        />

        <FormSelect
          label="시험 선택"
          required
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          disabled={!selectedCourseId || examsLoading}
          options={examOptions}
        />

        <FormInput
          label="예정일 (선택)"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
        />

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
                  disabled={isDataLoading}>
                  {allBelowCutlineSelected ? "재시험자 해제" : `재시험자 전체 선택 (${studentsBelowCutline.length}명)`}
                </button>
              )}
              <button
                onClick={handleSelectAll}
                className="text-body text-core-accent hover:underline"
                disabled={!selectedCourseId || isDataLoading || filteredStudents.length === 0}>
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
            disabled={!selectedCourseId}
          />

          <StudentListContainer>
            {!selectedCourseId ? (
              <StudentListEmpty message="수업을 먼저 선택하세요." />
            ) : isDataLoading ? (
              <StudentListSkeleton count={6} showCheckbox showRightContent />
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

          <div className="mt-spacing-200 text-body text-content-standard-secondary">
            선택된 학생: {selectedStudentIds.length}명
          </div>
        </div>
      </div>
    </Modal>
  );
}
