"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Modal, SearchInput } from "@/shared/components/ui";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
  type StudentListStudent,
} from "@/shared/components/ui/studentList";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
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
}

const SUBMISSION_STATUS_META = {
  완료: { variant: "success", label: "완료" },
  미흡: { variant: "danger", label: "미흡" },
  미제출: { variant: "danger", label: "미제출" },
  결석: { variant: "danger", label: "결석" },
  검사예정: { variant: "warning", label: "검사예정" },
  미배정: { variant: "neutral", label: "미배정" },
} as const;

// Display order for the summary band — completed/expected first, then severity, then unassigned.
const SUMMARY_ORDER = ["완료", "검사예정", "미흡", "미제출", "결석", "미배정"] as const;

export function SubmissionModal({
  isOpen,
  onClose,
  assignment,
  students,
  isLoading,
  existingSubmissions,
}: SubmissionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionStatuses, setSubmissionStatuses] = useState<Record<string, string>>({});
  const toast = useToast();
  const { assignTasks, isPending: isAssigning } = useAssignmentTaskAssign();

  useEffect(() => {
    if (isOpen && students.length > 0) {
      const initialSubmissions: Record<string, string> = {};
      for (const student of students) {
        initialSubmissions[student.id] = "미배정";
      }
      for (const submission of existingSubmissions) {
        initialSubmissions[submission.student.id] = submission.status;
      }
      setSubmissionStatuses(initialSubmissions);
    } else if (isOpen) {
      setSubmissionStatuses({});
    }
  }, [isOpen, existingSubmissions, students]);

  const handleClose = () => {
    setSearchQuery("");
    setSubmissionStatuses({});
    onClose();
  };

  const handleAssign = async () => {
    if (!assignment) return;

    const assignedStudentIds = new Set(existingSubmissions.map((submission) => submission.student.id));
    const unassignedStudentIds = students
      .filter((student) => !assignedStudentIds.has(student.id))
      .map((student) => student.id);

    if (unassignedStudentIds.length === 0) {
      toast.info("미배정 학생이 없습니다.");
      return;
    }

    try {
      await assignTasks({ assignmentId: assignment.id, studentIds: unassignedStudentIds });
      toast.success(`${unassignedStudentIds.length}명의 학생을 추가 배정했습니다.`);
    } catch (error) {
      if (error instanceof Error && error.message === "CONFLICT") {
        toast.error("이미 배정된 학생이 포함되어 있습니다.");
      } else {
        toast.error(getErrorMessage(error, "과제 할당에 실패했습니다."));
      }
    }
  };

  if (!assignment) return null;

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  // Distribution across all students (not the search-filtered view) — the point of a 현황 확인 screen.
  const statusCounts = students.reduce<Record<string, number>>((acc, student) => {
    const status = submissionStatuses[student.id] || "미배정";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});
  const unassignedCount = statusCounts["미배정"] ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="제출 현황 확인"
      subtitle={assignment.name}
      footer={
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">
              미배정 <span className="font-semibold text-foreground tabular-nums">{unassignedCount}</span>명
            </span>
            <Button
              variant="secondary"
              onClick={handleAssign}
              disabled={isAssigning || unassignedCount === 0}
              isLoading={isAssigning}
              loadingText="할당 중...">
              미배정 학생 배정
            </Button>
          </div>
          <span className="text-muted-foreground text-xs">상태 변경은 과제 관리 페이지에서만 가능합니다.</span>
          <Button variant="secondary" onClick={handleClose} className="w-full">
            닫기
          </Button>
        </div>
      }>
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full rounded-lg" />
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
          {/* At-a-glance distribution — this is a 현황 확인 screen, not an editor. */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs">
            {SUMMARY_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0;
              if (count === 0 && status !== "미배정") return null;
              const meta = SUBMISSION_STATUS_META[status];
              return (
                <Badge key={status} variant={meta.variant} size="sm">
                  <span className="font-bold tabular-nums">{count}</span>
                  <span className="ml-1 font-medium opacity-80">{meta.label}</span>
                </Badge>
              );
            })}
          </div>

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
                const currentStatus = submissionStatuses[student.id] || "미배정";
                const statusMeta =
                  SUBMISSION_STATUS_META[currentStatus as keyof typeof SUBMISSION_STATUS_META] ??
                  SUBMISSION_STATUS_META["미배정"];

                return (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    rightContent={
                      <Badge variant={statusMeta.variant} size="sm">
                        {statusMeta.label}
                      </Badge>
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
