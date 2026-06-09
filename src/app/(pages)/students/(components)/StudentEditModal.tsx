"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";
import { showEditModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentUpdate } from "../(hooks)/useStudentUpdate";
import { StudentFormFields } from "./StudentFormFields";
import { editStudentSchema, emptyStudentForm, type StudentFormValues } from "./studentSchema";

export default function StudentEditModal() {
  const [showModal, setShowModal] = useAtom(showEditModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const { updateStudent, isUpdating } = useStudentUpdate();
  const toast = useToast();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: emptyStudentForm,
    mode: "onTouched",
  });

  useEffect(() => {
    if (showModal && selectedStudent) {
      form.reset({
        name: selectedStudent.name,
        phoneNumber: selectedStudent.phone_number,
        parentPhoneNumber: selectedStudent.parent_phone_number || "",
        school: selectedStudent.school || "",
        branch: selectedStudent.branch || "",
        birthYear: selectedStudent.birth_year?.toString() || "",
        requiredClinicWeekdays: selectedStudent.required_clinic_weekdays || [],
      });
    }
  }, [showModal, selectedStudent, form]);

  if (!selectedStudent) return null;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateStudent({
        id: selectedStudent.id,
        name: values.name,
        phoneNumber: removePhoneHyphens(values.phoneNumber),
        parentPhoneNumber: values.parentPhoneNumber ? removePhoneHyphens(values.parentPhoneNumber) : null,
        school: values.school || null,
        branch: values.branch || null,
        birthYear: values.birthYear ? Number.parseInt(values.birthYear) : null,
        requiredClinicWeekdays: values.requiredClinicWeekdays.length > 0 ? values.requiredClinicWeekdays : null,
      });
      toast.success("학생 정보가 수정되었습니다.");
      setShowModal(false);
    } catch {
      toast.error("정보 수정에 실패했습니다.");
    }
  });

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSubmit={onSubmit}
      title="학생 정보 수정"
      subtitle={`${selectedStudent.name} 학생의 정보를 수정합니다`}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button className="flex-1" onClick={onSubmit} isLoading={isUpdating} loadingText="저장 중...">
            저장
          </Button>
        </>
      }>
      <StudentFormFields form={form} />
    </Modal>
  );
}
