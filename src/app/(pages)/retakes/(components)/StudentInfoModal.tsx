"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { selectedStudentIdAtom, showStudentModalAtom } from "../(atoms)/useModalStore";
import { useStudentInfo } from "../(hooks)/useStudentInfo";

export default function StudentInfoModal() {
  const [isOpen, setIsOpen] = useAtom(showStudentModalAtom);
  const [studentId, setStudentId] = useAtom(selectedStudentIdAtom);
  const { studentInfo, isLoading } = useStudentInfo(studentId);

  const handleClose = () => {
    setIsOpen(false);
    setStudentId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="학생 정보"
      footer={
        <Button variant="secondary" onClick={handleClose} className="w-full">
          닫기
        </Button>
      }>
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
        <div className="py-spacing-900 text-center text-content-standard-tertiary">학생 정보를 불러올 수 없습니다.</div>
      )}
    </Modal>
  );
}

export const openStudentInfoModal = (
  setShowModal: (show: boolean) => void,
  setStudentId: (id: string) => void,
  studentId: string,
) => {
  setStudentId(studentId);
  setShowModal(true);
};
