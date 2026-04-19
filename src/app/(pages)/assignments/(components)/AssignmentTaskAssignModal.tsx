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
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { hasActiveHiddenTag } from "@/shared/lib/utils/tags";
import { showAssignModalAtom } from "../(atoms)/useModalStore";
import { useAssignmentsForFilter } from "../(hooks)/useAssignmentsForFilter";
import { useAssignmentTaskAssign } from "../(hooks)/useAssignmentTaskAssign";
import { useCourses } from "../(hooks)/useCourses";
import { useStudentsForAssign } from "../(hooks)/useStudentsForAssign";

interface AssignmentTaskAssignModalProps {
  onSuccess?: () => void;
}

export default function AssignmentTaskAssignModal({ onSuccess }: AssignmentTaskAssignModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAssignModalAtom);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const { courses, isLoading: coursesLoading } = useCourses();
  const { assignments, isLoading: assignmentsLoading } = useAssignmentsForFilter(selectedCourseId || null);
  const { students, isLoading: studentsLoading } = useStudentsForAssign(selectedCourseId || null);
  const { assignTask, isAssigning } = useAssignmentTaskAssign();

  const visibleStudents = useMemo(() => students.filter((s) => !hasActiveHiddenTag(s)), [students]);

  const filteredStudents = useMemo(
    () =>
      visibleStudents
        .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [visibleStudents, searchQuery],
  );

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCourseId("");
    setSelectedAssignmentId("");
    setSelectedStudentIds([]);
    setScheduledDate("");
    setSearchQuery("");
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedAssignmentId("");
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

  const handleAssign = async () => {
    if (!selectedAssignmentId || selectedStudentIds.length === 0) {
      toast.info("모든 필수 항목을 입력해 주세요.");
      return;
    }

    try {
      await assignTask({
        assignmentId: selectedAssignmentId,
        studentIds: selectedStudentIds,
        scheduledDate: scheduledDate || null,
      });
      toast.success(`${selectedStudentIds.length}명의 과제가 배정되었습니다.`);
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "배정에 실패했습니다."));
    }
  };

  const courseOptions = [
    { value: "", label: "수업을 선택하세요" },
    ...courses.map((course) => ({ value: course.id, label: course.name })),
  ];

  const assignmentOptions = [
    { value: "", label: "과제를 선택하세요" },
    ...assignments.map((assignment) => ({ value: assignment.id, label: assignment.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleAssign}
      title="과제 배정"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedAssignmentId || selectedStudentIds.length === 0 || isAssigning}
            className="flex-1">
            {isAssigning ? "배정 중..." : "배정하기"}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <FormSelect
          label="수업 선택"
          required
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          disabled={coursesLoading}
          options={courseOptions}
        />

        <FormSelect
          label="과제 선택"
          required
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
          disabled={!selectedCourseId || assignmentsLoading}
          options={assignmentOptions}
        />

        <div className="flex flex-col gap-spacing-100">
          <FormInput
            label="예정일 (선택)"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
          <span className="text-content-standard-tertiary text-footnote">
            비워두면 학생별 클리닉 필참 요일에 자동 배정됩니다.
          </span>
        </div>

        <div className="flex flex-col gap-spacing-200">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-body text-content-standard-primary">
              학생 선택 <span className="text-core-status-negative">*</span>
            </label>
            <button
              onClick={handleSelectAll}
              className="text-body text-core-accent hover:underline"
              disabled={!selectedCourseId || studentsLoading || filteredStudents.length === 0}>
              {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                ? "전체 해제"
                : "전체 선택"}
            </button>
          </div>

          <SearchInput
            placeholder="학생 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!selectedCourseId}
          />

          <StudentListContainer>
            {!selectedCourseId ? (
              <StudentListEmpty message="수업을 먼저 선택하세요." />
            ) : studentsLoading ? (
              <StudentListSkeleton count={6} showCheckbox />
            ) : filteredStudents.length === 0 ? (
              <StudentListEmpty message={students.length === 0 ? "수강생이 없습니다." : "검색 결과가 없습니다."} />
            ) : (
              filteredStudents.map((student) => (
                <StudentListItem
                  key={student.id}
                  student={student}
                  selected={selectedStudentIds.includes(student.id)}
                  onToggle={() => handleStudentToggle(student.id)}
                />
              ))
            )}
          </StudentListContainer>

          <div className="text-body text-content-standard-secondary">선택된 학생: {selectedStudentIds.length}명</div>
        </div>
      </div>
    </Modal>
  );
}
