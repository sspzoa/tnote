"use client";

import StudentInfoModalWithAtoms from "@/shared/components/common/StudentInfoModalWithAtoms";
import { selectedStudentIdAtom, showStudentModalAtom } from "../(atoms)/useModalStore";

export default function StudentInfoModal() {
  return <StudentInfoModalWithAtoms showModalAtom={showStudentModalAtom} studentIdAtom={selectedStudentIdAtom} />;
}
