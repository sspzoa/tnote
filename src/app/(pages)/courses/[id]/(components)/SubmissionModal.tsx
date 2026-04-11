"use client";

import { useEffect, useState } from "react";
import { Button, Modal, SearchInput, Select } from "@/shared/components/ui";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
  type StudentListStudent,
} from "@/shared/components/ui/studentList";
import { useToast } from "@/shared/hooks/useToast";
import { useAssignmentTaskAssign } from "../(hooks)/useAssignmentTaskAssign";

interface ExistingSubmission {
  student: { id: string };
  status: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: { id: string; name: string } | null;
  students: StudentListStudent[];
  isLoading: boolean;
  existingSubmissions: ExistingSubmission[];
  onSave: (submissions: Array<{ studentId: string; status: string }>) => Promise<void>;
  isSaving: boolean;
}

export function SubmissionModal({
  isOpen,
  onClose,
  assignment,
  students,
  isLoading,
  existingSubmissions,
  onSave,
  isSaving,
}: SubmissionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionInputs, setSubmissionInputs] = useState<Record<string, string>>({});
  const toast = useToast();
  const { assignTasks, isPending: isAssigning } = useAssignmentTaskAssign();

  useEffect(() => {
    if (isOpen && students.length > 0) {
      const initialSubmissions: Record<string, string> = {};
      for (const student of students) {
        initialSubmissions[student.id] = "미제출";
      }
      for (const submission of existingSubmissions) {
        initialSubmissions[submission.student.id] = submission.status;
      }
      setSubmissionInputs(initialSubmissions);
    } else if (isOpen) {
      setSubmissionInputs({});
    }
  }, [isOpen, existingSubmissions, students]);

  const handleClose = () => {
    setSearchQuery("");
    setSubmissionInputs({});
    onClose();
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setSubmissionInputs((prev) => {
      if (status === "") {
        const newInputs = { ...prev };
        delete newInputs[studentId];
        return newInputs;
      }
      return { ...prev, [studentId]: status };
    });
  };

  const handleSave = async () => {
    if (!assignment) return;

    const submissions = Object.entries(submissionInputs)
      .filter(([, status]) => status !== "")
      .map(([studentId, status]) => ({ studentId, status }));

    await onSave(submissions);
  };

  const handleAssign = async () => {
    if (!assignment) return;

    const incompleteStudentIds = Object.entries(submissionInputs)
      .filter(([, status]) => status === "검사예정")
      .map(([studentId]) => studentId);

    if (incompleteStudentIds.length === 0) {
      toast.info("검사예정 학생이 없습니다.");
      return;
    }

    try {
      await assignTasks({ assignmentId: assignment.id, studentIds: incompleteStudentIds });
      toast.success(`${incompleteStudentIds.length}명의 학생에게 재과제를 할당했습니다.`);
    } catch (error) {
      if (error instanceof Error && error.message === "CONFLICT") {
        toast.error("이미 할당된 학생이 있습니다.");
      } else {
        toast.error(error instanceof Error ? error.message : "과제 할당에 실패했습니다.");
      }
    }
  };

  if (!assignment) return null;

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const submissionCount = Object.values(submissionInputs).filter((v) => v !== "").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSave}
      title="제출 현황 입력"
      subtitle={assignment.name}
      footer={
        <div className="flex w-full flex-col gap-spacing-300">
          <div className="flex items-center justify-between text-body">
            <span className="text-content-standard-secondary">입력: {submissionCount}명</span>
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
            <Button
              variant="secondary"
              onClick={handleAssign}
              disabled={isSaving || isAssigning}
              isLoading={isAssigning}
              loadingText="할당 중..."
              className="flex-1">
              재과제 할당
            </Button>
          </div>
        </div>
      }>
      {isLoading ? (
        <div className="flex flex-col gap-spacing-400">
          <div className="h-12 animate-pulse rounded-radius-300 bg-components-fill-standard-secondary" />
          <StudentListContainer>
            <StudentListSkeleton count={6} showCheckbox={false} showRightContent />
          </StudentListContainer>
        </div>
      ) : students.length === 0 ? (
        <StudentListContainer>
          <StudentListEmpty message="수강생이 없습니다." />
        </StudentListContainer>
      ) : (
        <div className="flex flex-col gap-spacing-400">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 검색..."
          />

          <StudentListContainer>
            {filteredStudents.length === 0 ? (
              <StudentListEmpty message="검색 결과가 없습니다." />
            ) : (
              filteredStudents.map((student) => {
                const currentStatus = submissionInputs[student.id] || "";

                return (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    rightContent={
                      <Select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        onKeyDown={(e) => {
                          const keyMap: Record<string, string> = {
                            "1": "완료",
                            "2": "미흡",
                            "3": "미제출",
                            "4": "검사예정",
                          };
                          const value = keyMap[e.key];
                          if (value) {
                            e.preventDefault();
                            handleStatusChange(student.id, currentStatus === value ? "" : value);
                          }
                        }}
                        placeholder="-"
                        options={[
                          { value: "완료", label: "완료" },
                          { value: "미흡", label: "미흡" },
                          { value: "미제출", label: "미제출" },
                          { value: "검사예정", label: "검사예정" },
                        ]}
                        className="w-20 bg-components-fill-standard-primary text-center"
                      />
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
