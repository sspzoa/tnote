"use client";

import { useAtom } from "jotai";
import { useStudentDetail } from "@/app/(pages)/students/(hooks)/useStudentDetail";
import StudentInfoModalBase from "@/shared/components/common/StudentInfoModal";
import { selectedStudentIdAtom, showStudentModalAtom } from "../(atoms)/useModalStore";

export default function StudentInfoModal() {
  const [isOpen, setIsOpen] = useAtom(showStudentModalAtom);
  const [studentId, setStudentId] = useAtom(selectedStudentIdAtom);
  const { studentDetail, isLoading } = useStudentDetail(studentId);

  const handleClose = () => {
    setIsOpen(false);
    setStudentId(null);
  };

  return (
    <StudentInfoModalBase isOpen={isOpen} onClose={handleClose} studentDetail={studentDetail} isLoading={isLoading} />
  );
}
