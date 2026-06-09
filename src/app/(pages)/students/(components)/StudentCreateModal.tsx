"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";
import { showCreateModalAtom } from "../(atoms)/useModalStore";
import { useStudentCreate } from "../(hooks)/useStudentCreate";
import { StudentFormFields } from "./StudentFormFields";
import { createStudentSchema, emptyStudentForm, type StudentFormValues } from "./studentSchema";

export default function StudentCreateModal() {
  const [showModal, setShowModal] = useAtom(showCreateModalAtom);
  const { createStudent, isCreating } = useStudentCreate();
  const toast = useToast();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: emptyStudentForm,
    mode: "onTouched",
  });

  const close = () => {
    setShowModal(false);
    form.reset(emptyStudentForm);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createStudent({
        name: values.name,
        phoneNumber: removePhoneHyphens(values.phoneNumber),
        parentPhoneNumber: values.parentPhoneNumber ? removePhoneHyphens(values.parentPhoneNumber) : null,
        school: values.school || null,
        branch: values.branch || null,
        birthYear: values.birthYear || null,
        requiredClinicWeekdays: values.requiredClinicWeekdays.length > 0 ? values.requiredClinicWeekdays : null,
      });
      toast.success("학생이 추가되었습니다.");
      close();
    } catch (error) {
      toast.error(getErrorMessage(error, "학생 추가에 실패했습니다."));
    }
  });

  return (
    <Modal
      isOpen={showModal}
      onClose={close}
      onSubmit={onSubmit}
      title="학생 추가"
      subtitle="새로운 학생을 추가합니다. 비밀번호는 전화번호로 자동 설정됩니다."
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={close}>
            취소
          </Button>
          <Button className="flex-1" onClick={onSubmit} isLoading={isCreating} loadingText="추가 중...">
            추가
          </Button>
        </>
      }>
      <StudentFormFields form={form} strict />
    </Modal>
  );
}
