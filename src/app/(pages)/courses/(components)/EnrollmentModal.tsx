import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListLoading,
} from "@/shared/components/ui/studentList";
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

  const { students: allStudents } = useAllStudents();
  const { enrolledStudents, isLoading: isLoadingEnrolled } = useEnrolledStudents(selectedCourse?.id || null);
  const { enrollStudent } = useCourseEnroll();
  const { unenrollStudent } = useCourseUnenroll();

  if (!selectedCourse) return null;

  const unenrolledStudents = allStudents.filter(
    (student) => !enrolledStudents.find((enrolled) => enrolled.id === student.id),
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
      alert(error instanceof Error ? error.message : "학생 등록에 실패했습니다.");
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      await unenrollStudent({ courseId: selectedCourse.id, studentId });
    } catch {
      alert("학생 제거에 실패했습니다.");
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
      footer={
        <Button variant="secondary" onClick={() => setShowModal(false)} className="w-full">
          닫기
        </Button>
      }>
      {isLoadingEnrolled ? (
        <StudentListContainer>
          <StudentListLoading />
        </StudentListContainer>
      ) : (
        <div className="flex h-96 gap-spacing-500">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <h3 className="mb-spacing-300 font-bold text-body text-content-standard-primary">
              등록된 학생 ({enrolledStudents.length}명)
            </h3>
            {enrolledStudents.length === 0 ? (
              <StudentListContainer className="flex-1">
                <StudentListEmpty message="등록된 학생이 없습니다." />
              </StudentListContainer>
            ) : (
              <>
                <SearchInput
                  placeholder="학생 검색..."
                  value={enrolledSearchQuery}
                  onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                  className="mb-spacing-300"
                />
                <StudentListContainer className="flex-1">
                  {filteredEnrolledStudents.length === 0 ? (
                    <StudentListEmpty message="검색 결과가 없습니다." />
                  ) : (
                    filteredEnrolledStudents.map((student) => (
                      <StudentListItem
                        key={student.id}
                        student={student}
                        rightContent={
                          <button
                            onClick={() => handleUnenroll(student.id)}
                            disabled={loadingStudentId === student.id}
                            className="rounded-radius-200 bg-solid-translucent-red px-spacing-300 py-spacing-150 font-medium text-core-status-negative text-footnote transition-colors hover:bg-solid-translucent-red disabled:cursor-not-allowed disabled:opacity-50">
                            {loadingStudentId === student.id ? "제거 중..." : "제거"}
                          </button>
                        }
                      />
                    ))
                  )}
                </StudentListContainer>
              </>
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <h3 className="mb-spacing-300 font-bold text-body text-content-standard-primary">
              학생 추가 ({unenrolledStudents.length}명)
            </h3>
            {unenrolledStudents.length === 0 ? (
              <StudentListContainer className="flex-1">
                <StudentListEmpty message="모든 학생이 등록되었습니다." />
              </StudentListContainer>
            ) : (
              <>
                <SearchInput
                  placeholder="학생 검색..."
                  value={unenrolledSearchQuery}
                  onChange={(e) => setUnenrolledSearchQuery(e.target.value)}
                  className="mb-spacing-300"
                />
                <StudentListContainer className="flex-1">
                  {filteredUnenrolledStudents.length === 0 ? (
                    <StudentListEmpty message="검색 결과가 없습니다." />
                  ) : (
                    filteredUnenrolledStudents.map((student) => (
                      <StudentListItem
                        key={student.id}
                        student={student}
                        rightContent={
                          <button
                            onClick={() => handleEnroll(student.id)}
                            disabled={loadingStudentId === student.id}
                            className="rounded-radius-200 bg-solid-translucent-green px-spacing-300 py-spacing-150 font-medium text-core-status-positive text-footnote transition-colors hover:bg-solid-translucent-green disabled:cursor-not-allowed disabled:opacity-50">
                            {loadingStudentId === student.id ? "추가 중..." : "추가"}
                          </button>
                        }
                      />
                    ))
                  )}
                </StudentListContainer>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
