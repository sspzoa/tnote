"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormSelect } from "@/shared/components/ui/formSelect";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { showAssignModalAtom } from "../(atoms)/useModalStore";
import { useCoursesForAssign } from "../(hooks)/useCoursesForAssign";
import { useExamsForAssign } from "../(hooks)/useExamsForAssign";
import { useRetakeAssign } from "../(hooks)/useRetakeAssign";
import { useStudentsForAssign } from "../(hooks)/useStudentsForAssign";

interface RetakeAssignModalProps {
  onSuccess?: () => void;
}

export default function RetakeAssignModal({ onSuccess }: RetakeAssignModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAssignModalAtom);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { courses, isLoading: coursesLoading } = useCoursesForAssign();
  const { exams, isLoading: examsLoading } = useExamsForAssign(selectedCourseId || null);
  const { students, isLoading: studentsLoading } = useStudentsForAssign(selectedCourseId || null);
  const { assignRetake, isAssigning } = useRetakeAssign();

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
    const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleAssign = async () => {
    if (!selectedExamId || selectedStudentIds.length === 0) {
      alert("모든 필수 항목을 입력해주세요.");
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
              </label>
              <button
                onClick={handleSelectAll}
                className="text-body text-core-accent hover:underline"
                disabled={studentsLoading || filteredStudents.length === 0}>
                {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                  ? "전체 해제"
                  : "전체 선택"}
              </button>
            </div>

            <SearchInput
              placeholder="학생 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-spacing-300"
            />

            <div className="max-h-64 overflow-y-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary">
              {studentsLoading ? (
                <div className="py-spacing-600 text-center text-content-standard-tertiary">로딩중...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-spacing-600 text-center text-content-standard-tertiary">
                  {students.length === 0 ? "수강생이 없습니다." : "검색 결과가 없습니다."}
                </div>
              ) : (
                <div className="divide-y divide-line-divider">
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-center gap-spacing-300 px-spacing-400 py-spacing-300 transition-colors hover:bg-components-interactive-hover">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="size-4 cursor-pointer accent-core-accent"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                        <div className="text-content-standard-tertiary text-footnote">
                          {formatPhoneNumber(student.phone_number)} {student.school && `· ${student.school}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

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
