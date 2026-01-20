import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormCheckbox } from "@/shared/components/ui/formCheckbox";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { consultationFormAtom, selectedConsultationAtom } from "../(atoms)/useConsultationStore";
import { showAddConsultationModalAtom, showEditConsultationModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useConsultationCreate } from "../(hooks)/useConsultationCreate";
import { useConsultationDelete } from "../(hooks)/useConsultationDelete";
import { useConsultationUpdate } from "../(hooks)/useConsultationUpdate";

const NEW_STUDENT_TEMPLATE = `1. 수강 계기
-

2. 공부해 오던 방식
- 

3. 기존 성적대
- 

4. 목표 성적대
- 

5. 특별히 원하는 점
- 

6. 기타
- `;

export default function ConsultationFormModal() {
  const [showAddModal, setShowAddModal] = useAtom(showAddConsultationModalAtom);
  const [showEditModal, setShowEditModal] = useAtom(showEditConsultationModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const selectedConsultation = useAtomValue(selectedConsultationAtom);
  const [form, setForm] = useAtom(consultationFormAtom);
  const [isNewStudentConsultation, setIsNewStudentConsultation] = useState(false);
  const { createConsultation, isCreating } = useConsultationCreate();
  const { updateConsultation, isUpdating } = useConsultationUpdate();
  const { deleteConsultation, isDeleting } = useConsultationDelete();

  const isEditMode = showEditModal;
  const showModal = showAddModal || showEditModal;
  const isSaving = isCreating || isUpdating;

  if (!showModal || !selectedStudent) return null;

  const handleClose = () => {
    if (isEditMode) {
      setShowEditModal(false);
    } else {
      setShowAddModal(false);
      setIsNewStudentConsultation(false);
    }
  };

  const handleNewStudentCheckbox = (checked: boolean) => {
    setIsNewStudentConsultation(checked);
    if (checked) {
      setForm({
        ...form,
        title: "신규생 상담",
        content: NEW_STUDENT_TEMPLATE,
      });
    } else {
      setForm({
        ...form,
        title: "",
        content: "",
      });
    }
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 상담 내용을 입력해 주세요.");
      return;
    }

    try {
      await createConsultation({
        studentId: selectedStudent.id,
        title: form.title,
        content: form.content,
      });
      alert("상담일지가 추가되었습니다.");
      setShowAddModal(false);
      setForm({ title: "", content: "" });
      setIsNewStudentConsultation(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "상담일지 추가에 실패했습니다.");
    }
  };

  const handleEdit = async () => {
    if (!selectedConsultation || !form.title.trim() || !form.content.trim()) {
      alert("제목과 상담 내용을 입력해 주세요.");
      return;
    }

    try {
      await updateConsultation({
        consultationId: selectedConsultation.id,
        studentId: selectedStudent.id,
        title: form.title,
        content: form.content,
      });
      alert("상담일지가 수정되었습니다.");
      setShowEditModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "상담일지 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!selectedConsultation) return;

    if (!confirm("이 상담일지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteConsultation({
        consultationId: selectedConsultation.id,
        studentId: selectedStudent.id,
      });
      alert("상담일지가 삭제되었습니다.");
      setShowEditModal(false);
    } catch {
      alert("상담일지 삭제에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title={isEditMode ? "상담일지 수정" : "상담일지 추가"}
      subtitle={!isEditMode ? `${selectedStudent.name} 학생의 상담일지를 작성합니다` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          {isEditMode && (
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="flex-1">
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          )}
          <Button
            onClick={isEditMode ? handleEdit : handleAdd}
            disabled={isSaving || !form.title.trim() || !form.content.trim()}
            className="flex-1">
            {isSaving ? "저장 중..." : isEditMode ? "저장" : "추가"}
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        {!isEditMode && (
          <FormCheckbox
            label="신규생 상담 (템플릿 자동 입력)"
            checked={isNewStudentConsultation}
            onChange={(e) => handleNewStudentCheckbox(e.target.checked)}
          />
        )}

        <FormInput
          label="제목"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="상담 제목을 입력하세요"
        />

        <FormTextarea
          label="상담 내용"
          required
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          placeholder="상담 내용을 입력하세요"
        />
      </div>
    </Modal>
  );
}
