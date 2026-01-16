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

type AssignmentStatus = "완료" | "미흡" | "미제출";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  students: StudentListStudent[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  assignmentInputs: Record<string, string>;
  onAssignmentChange: (studentId: string, status: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const statusStyles: Record<AssignmentStatus, { active: string; inactive: string }> = {
  완료: {
    active: "bg-solid-translucent-green text-solid-green",
    inactive:
      "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover",
  },
  미흡: {
    active: "bg-solid-translucent-orange text-solid-orange",
    inactive:
      "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover",
  },
  미제출: {
    active: "bg-solid-translucent-red text-core-status-negative",
    inactive:
      "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover",
  },
};

export function AssignmentModal({
  isOpen,
  onClose,
  exam,
  students,
  isLoading,
  searchQuery,
  onSearchChange,
  assignmentInputs,
  onAssignmentChange,
  onSave,
  isSaving,
}: AssignmentModalProps) {
  if (!exam) return null;

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusCounts = () => {
    const counts = { 완료: 0, 미흡: 0, 미제출: 0 };
    for (const status of Object.values(assignmentInputs)) {
      if (status === "완료" || status === "미흡" || status === "미제출") {
        counts[status]++;
      }
    }
    return counts;
  };

  const statusCounts = getStatusCounts();
  const inputCount = Object.values(assignmentInputs).filter((v) => v !== "").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="과제 관리"
      subtitle={`${exam.name} (${exam.exam_number}회차)`}
      maxWidth="2xl"
      footer={
        !isLoading && students.length > 0 ? (
          <div className="w-full">
            <div className="mb-spacing-300 flex items-center justify-between text-body">
              <span className="text-content-standard-secondary">
                입력됨: {inputCount}명 / {students.length}명
              </span>
              <div className="flex items-center gap-spacing-400">
                {statusCounts["완료"] > 0 && <span className="text-solid-green">완료: {statusCounts["완료"]}명</span>}
                {statusCounts["미흡"] > 0 && <span className="text-solid-orange">미흡: {statusCounts["미흡"]}명</span>}
                {statusCounts["미제출"] > 0 && (
                  <span className="text-core-status-negative">미제출: {statusCounts["미제출"]}명</span>
                )}
              </div>
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
                const currentStatus = assignmentInputs[student.id] || "";

                return (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    rightContent={
                      <div className="flex items-center gap-spacing-100">
                        {(["완료", "미흡", "미제출"] as AssignmentStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => onAssignmentChange(student.id, status)}
                            className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote transition-all ${
                              currentStatus === status ? statusStyles[status].active : statusStyles[status].inactive
                            }`}>
                            {status}
                          </button>
                        ))}
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
