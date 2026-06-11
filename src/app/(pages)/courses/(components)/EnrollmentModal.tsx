"use client";

import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
} from "@/shared/components/ui/studentList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { hasActiveHiddenTag } from "@/shared/lib/utils/tags";
import { enrolledSearchQueryAtom, selectedCourseAtom, unenrolledSearchQueryAtom } from "../(atoms)/useCoursesStore";
import { showEnrollModalAtom } from "../(atoms)/useModalStore";
import { useAllStudents } from "../(hooks)/useAllStudents";
import { useCourseEnroll } from "../(hooks)/useCourseEnroll";
import { useCourseUnenroll } from "../(hooks)/useCourseUnenroll";
import { useEnrolledStudents } from "../(hooks)/useEnrolledStudents";

export default function EnrollmentModal() {
  const [showModal, setShowModal] = useAtom(showEnrollModalAtom);
  const selectedCourse = useAtomValue(selectedCourseAtom);
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useAtom(enrolledSearchQueryAtom);
  const [unenrolledSearchQuery, setUnenrolledSearchQuery] = useAtom(unenrolledSearchQueryAtom);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const toast = useToast();

  const { students: allStudents } = useAllStudents();
  const { enrolledStudents, isLoading: isLoadingEnrolled } = useEnrolledStudents(selectedCourse?.id || null);
  const { enrollStudent } = useCourseEnroll();
  const { unenrollStudent } = useCourseUnenroll();

  if (!selectedCourse) return null;

  const unenrolledStudents = allStudents.filter(
    (student) => !enrolledStudents.find((enrolled) => enrolled.id === student.id) && !hasActiveHiddenTag(student),
  );

  const filteredEnrolledStudents = enrolledStudents
    .filter((student) => student.name.toLowerCase().includes(enrolledSearchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const filteredUnenrolledStudents = unenrolledStudents
    .filter((student) => student.name.toLowerCase().includes(unenrolledSearchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const handleEnroll = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      await enrollStudent({ courseId: selectedCourse.id, studentId });
    } catch (error) {
      toast.error(getErrorMessage(error, "학생 등록에 실패했습니다."));
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      await unenrollStudent({ courseId: selectedCourse.id, studentId });
    } catch {
      toast.error("학생 제거에 실패했습니다.");
    } finally {
      setLoadingStudentId(null);
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="학생 관리"
      subtitle={selectedCourse.name}
      size="md"
      footer={
        <Button variant="secondary" onClick={() => setShowModal(false)} className="w-full">
          닫기
        </Button>
      }>
      {isLoadingEnrolled ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <StudentListContainer>
            <StudentListSkeleton count={5} showCheckbox={false} showRightContent />
          </StudentListContainer>
        </div>
      ) : (
        <Tabs defaultValue="enrolled" className="gap-3">
          <TabsList className="w-full">
            <TabsTrigger value="enrolled" className="flex-1">
              등록된 학생
              <span className="tabular-nums text-muted-foreground text-xs">({enrolledStudents.length}명)</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex-1">
              학생 추가
              <span className="tabular-nums text-muted-foreground text-xs">({unenrolledStudents.length}명)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="flex flex-col gap-3">
            <SearchInput
              placeholder="이름으로 검색..."
              value={enrolledSearchQuery}
              onChange={(e) => setEnrolledSearchQuery(e.target.value)}
            />
            <StudentListContainer>
              {enrolledStudents.length === 0 ? (
                <StudentListEmpty message="등록된 학생이 없습니다." />
              ) : filteredEnrolledStudents.length === 0 ? (
                <StudentListEmpty message="검색 결과가 없습니다." />
              ) : (
                filteredEnrolledStudents.map((student) => (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    rightContent={
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleUnenroll(student.id)}
                        disabled={loadingStudentId === student.id}
                        className="text-destructive hover:bg-destructive-soft hover:text-destructive">
                        {loadingStudentId === student.id ? "제거 중..." : "제거"}
                      </Button>
                    }
                  />
                ))
              )}
            </StudentListContainer>
          </TabsContent>

          <TabsContent value="add" className="flex flex-col gap-3">
            <SearchInput
              placeholder="이름으로 검색..."
              value={unenrolledSearchQuery}
              onChange={(e) => setUnenrolledSearchQuery(e.target.value)}
            />
            <StudentListContainer>
              {unenrolledStudents.length === 0 ? (
                <StudentListEmpty message="모든 학생이 등록되었습니다." />
              ) : filteredUnenrolledStudents.length === 0 ? (
                <StudentListEmpty message="검색 결과가 없습니다." />
              ) : (
                filteredUnenrolledStudents.map((student) => (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    rightContent={
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEnroll(student.id)}
                        disabled={loadingStudentId === student.id}
                        className="text-success hover:bg-success-soft hover:text-success">
                        {loadingStudentId === student.id ? "추가 중..." : "추가"}
                      </Button>
                    }
                  />
                ))
              )}
            </StudentListContainer>
          </TabsContent>
        </Tabs>
      )}
    </Modal>
  );
}
