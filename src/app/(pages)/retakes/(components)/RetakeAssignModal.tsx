"use client";

import { useAtom } from "jotai";
import { useState } from "react";
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
    if (!selectedExamId || selectedStudentIds.length === 0 || !scheduledDate) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      await assignRetake({
        examId: selectedExamId,
        studentIds: selectedStudentIds,
        scheduledDate,
      });
      alert(`${selectedStudentIds.length}명의 재시험이 배정되었습니다.`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "재시험 배정에 실패했습니다.");
    }
  };

  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="font-bold text-content-standard-primary text-title">재시험 배정</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-spacing-600">
          <div className="space-y-spacing-500">
            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                과목 선택 <span className="text-core-status-negative">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                disabled={coursesLoading}
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">과목을 선택하세요</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourseId && (
              <div>
                <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                  시험 선택 <span className="text-core-status-negative">*</span>
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  disabled={examsLoading}
                  className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">시험을 선택하세요</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} {exam.exam_number}회차
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                예정일 <span className="text-core-status-negative">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>

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

                <input
                  type="text"
                  placeholder="학생 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-spacing-300 w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
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
                          <span className="text-body text-content-standard-primary">{student.name}</span>
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
        </div>

        <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={handleClose}
            className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedExamId || selectedStudentIds.length === 0 || !scheduledDate || isAssigning}
            className="flex-1 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {isAssigning ? "배정 중..." : "배정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
