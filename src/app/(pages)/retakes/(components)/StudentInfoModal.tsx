"use client";

import { useAtom } from "jotai";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { selectedStudentIdAtom, showStudentModalAtom } from "../(atoms)/useModalStore";
import { useStudentInfo } from "../(hooks)/useStudentInfo";

export default function StudentInfoModal() {
  const [isOpen, setIsOpen] = useAtom(showStudentModalAtom);
  const [studentId, setStudentId] = useAtom(selectedStudentIdAtom);
  const { studentInfo, isLoading } = useStudentInfo(studentId);

  const getAge = (birthYear: number | null | undefined) => {
    if (!birthYear) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear + 1;
  };

  const getGrade = (birthYear: number | null | undefined) => {
    if (!birthYear) return null;
    const age = getAge(birthYear);
    const gradeNumber = age - 6;

    if (gradeNumber <= 0) return "미취학";
    if (gradeNumber <= 6) return `초${gradeNumber}`;
    if (gradeNumber <= 9) return `중${gradeNumber - 6}`;
    if (gradeNumber <= 12) return `고${gradeNumber - 9}`;
    return "졸업";
  };

  const handleClose = () => {
    setIsOpen(false);
    setStudentId(null);
  };

  // Public method to open modal with student ID
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="font-bold text-content-standard-primary text-title">학생 정보</h2>
        </div>

        <div className="p-spacing-600">
          {isLoading ? (
            <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
          ) : studentInfo ? (
            <div className="space-y-spacing-400">
              <div>
                <div className="mb-spacing-200 flex items-center gap-spacing-300">
                  <h3 className="font-bold text-content-standard-primary text-heading">{studentInfo.name}</h3>
                  {studentInfo.birth_year && getGrade(studentInfo.birth_year) && (
                    <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                      {getGrade(studentInfo.birth_year)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-spacing-300">
                <div className="flex items-start gap-spacing-300">
                  <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">전화번호</span>
                  <span className="font-medium text-body text-content-standard-primary">
                    {formatPhoneNumber(studentInfo.phone_number)}
                  </span>
                </div>

                {studentInfo.parent_phone_number && (
                  <div className="flex items-start gap-spacing-300">
                    <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">부모님</span>
                    <span className="text-body text-content-standard-secondary">
                      {formatPhoneNumber(studentInfo.parent_phone_number)}
                    </span>
                  </div>
                )}

                {studentInfo.school && (
                  <div className="flex items-start gap-spacing-300">
                    <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">학교</span>
                    <span className="text-body text-content-standard-secondary">{studentInfo.school}</span>
                  </div>
                )}

                {studentInfo.birth_year && (
                  <div className="flex items-start gap-spacing-300">
                    <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">출생년도</span>
                    <span className="text-body text-content-standard-secondary">{studentInfo.birth_year}년</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-spacing-900 text-center text-content-standard-tertiary">
              학생 정보를 불러올 수 없습니다.
            </div>
          )}
        </div>

        <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={handleClose}
            className="w-full rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// Export a way to open the modal with student ID
export const openStudentInfoModal = (
  setShowModal: (show: boolean) => void,
  setStudentId: (id: string) => void,
  studentId: string,
) => {
  setStudentId(studentId);
  setShowModal(true);
};
