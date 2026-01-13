import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
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

  const filteredEnrolledStudents = enrolledStudents.filter((student) =>
    student.name.toLowerCase().includes(enrolledSearchQuery.toLowerCase()),
  );

  const filteredUnenrolledStudents = unenrolledStudents.filter((student) =>
    student.name.toLowerCase().includes(unenrolledSearchQuery.toLowerCase()),
  );

  const handleEnroll = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      await enrollStudent({ courseId: selectedCourse.id, studentId });
    } catch (error) {
      console.error("Enroll error:", error);
      alert(error instanceof Error ? error.message : "학생 등록에 실패했습니다.");
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      await unenrollStudent({ courseId: selectedCourse.id, studentId });
    } catch (error) {
      console.error("Unenroll error:", error);
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
      maxWidth="xl"
      footer={
        <Button variant="secondary" onClick={() => setShowModal(false)} className="w-full">
          닫기
        </Button>
      }>
      {isLoadingEnrolled ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
      ) : (
        <>
          {/* 등록된 학생 */}
          <div className="mb-spacing-600">
            <h3 className="mb-spacing-300 font-bold text-body text-content-standard-primary">
              등록된 학생 ({enrolledStudents.length}명)
            </h3>
            {enrolledStudents.length === 0 ? (
              <p className="text-content-standard-tertiary text-label">등록된 학생이 없습니다.</p>
            ) : (
              <>
                <SearchInput
                  placeholder="이름 검색..."
                  value={enrolledSearchQuery}
                  onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                  className="mb-spacing-300"
                />
                {filteredEnrolledStudents.length === 0 ? (
                  <p className="text-content-standard-tertiary text-label">검색 결과가 없습니다.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-spacing-200">
                      {filteredEnrolledStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between rounded-radius-200 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200">
                          <div>
                            <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                            <div className="text-content-standard-tertiary text-footnote">
                              {formatPhoneNumber(student.phone_number)} {student.school && `· ${student.school}`}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnenroll(student.id)}
                            disabled={loadingStudentId === student.id}
                            className="rounded-radius-200 bg-solid-translucent-red px-spacing-300 py-spacing-150 font-medium text-footnote text-solid-red transition-colors hover:bg-solid-translucent-pink disabled:cursor-not-allowed disabled:opacity-50">
                            {loadingStudentId === student.id ? "제거 중..." : "제거"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 미등록 학생 */}
          <div>
            <h3 className="mb-spacing-300 font-bold text-body text-content-standard-primary">
              학생 추가 ({unenrolledStudents.length}명)
            </h3>
            {unenrolledStudents.length === 0 ? (
              <p className="text-content-standard-tertiary text-label">모든 학생이 등록되었습니다.</p>
            ) : (
              <>
                <SearchInput
                  placeholder="이름 검색..."
                  value={unenrolledSearchQuery}
                  onChange={(e) => setUnenrolledSearchQuery(e.target.value)}
                  className="mb-spacing-300"
                />
                {filteredUnenrolledStudents.length === 0 ? (
                  <p className="text-content-standard-tertiary text-label">검색 결과가 없습니다.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-spacing-200">
                      {filteredUnenrolledStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between rounded-radius-200 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200">
                          <div>
                            <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                            <div className="text-content-standard-tertiary text-footnote">
                              {formatPhoneNumber(student.phone_number)} {student.school && `· ${student.school}`}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnroll(student.id)}
                            disabled={loadingStudentId === student.id}
                            className="rounded-radius-200 bg-solid-translucent-green px-spacing-300 py-spacing-150 font-medium text-footnote text-solid-green transition-colors hover:bg-solid-translucent-green disabled:cursor-not-allowed disabled:opacity-50">
                            {loadingStudentId === student.id ? "추가 중..." : "추가"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
