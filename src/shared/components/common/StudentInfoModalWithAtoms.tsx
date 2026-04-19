"use client";

import type { PrimitiveAtom } from "jotai";
import { useAtom } from "jotai";
import { useStudentDetail } from "@/app/(pages)/students/(hooks)/useStudentDetail";
import StudentInfoModalBase from "./StudentInfoModal";

interface StudentInfoModalWithAtomsProps {
  showModalAtom: PrimitiveAtom<boolean>;
  studentIdAtom: PrimitiveAtom<string | null>;
}

export default function StudentInfoModalWithAtoms({ showModalAtom, studentIdAtom }: StudentInfoModalWithAtomsProps) {
  const [isOpen, setIsOpen] = useAtom(showModalAtom);
  const [studentId, setStudentId] = useAtom(studentIdAtom);
  const { studentDetail, isLoading } = useStudentDetail(studentId);

  const handleClose = () => {
    setIsOpen(false);
    setStudentId(null);
  };

  return (
    <StudentInfoModalBase
      isOpen={isOpen}
      onClose={handleClose}
      studentId={studentId || ""}
      studentDetail={studentDetail}
      isLoading={isLoading}
    />
  );
}
