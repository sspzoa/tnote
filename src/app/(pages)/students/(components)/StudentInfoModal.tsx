"use client";

import { useAtom, useAtomValue } from "jotai";
import StudentInfoModalBase from "@/shared/components/common/StudentInfoModal";
import { showInfoModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentDetail } from "../(hooks)/useStudentDetail";

export default function StudentInfoModal() {
  const [showModal, setShowModal] = useAtom(showInfoModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const { studentDetail, isLoading } = useStudentDetail(selectedStudent?.id || null);

  if (!selectedStudent) return null;

  return (
    <StudentInfoModalBase
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      studentDetail={studentDetail}
      isLoading={isLoading}
    />
  );
}
