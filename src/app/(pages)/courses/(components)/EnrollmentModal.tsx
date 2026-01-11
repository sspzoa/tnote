import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
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

  if (!showModal || !selectedCourse) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={() => setShowModal(false)}>
      <div
        className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="mb-spacing-100 font-bold text-content-standard-primary text-heading">학생 관리</h2>
          <p className="text-content-standard-secondary text-label">{selectedCourse.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-spacing-600">
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
                    <input
                      type="text"
                      placeholder="이름 검색..."
                      value={enrolledSearchQuery}
                      onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                      className="mb-spacing-300 w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-content-standard-primary text-label transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                    {filteredEnrolledStudents.length === 0 ? (
                      <p className="text-content-standard-tertiary text-label">검색 결과가 없습니다.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-spacing-200">
                        {filteredEnrolledStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between rounded-radius-200 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200">
                            <div>
                              <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                              <div className="text-content-standard-tertiary text-footnote">{student.phone_number}</div>
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
                    <input
                      type="text"
                      placeholder="이름 검색..."
                      value={unenrolledSearchQuery}
                      onChange={(e) => setUnenrolledSearchQuery(e.target.value)}
                      className="mb-spacing-300 w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-content-standard-primary text-label transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                    {filteredUnenrolledStudents.length === 0 ? (
                      <p className="text-content-standard-tertiary text-label">검색 결과가 없습니다.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-spacing-200">
                        {filteredUnenrolledStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between rounded-radius-200 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200">
                            <div>
                              <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                              <div className="text-content-standard-tertiary text-footnote">{student.phone_number}</div>
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
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={() => setShowModal(false)}
            className="w-full rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
