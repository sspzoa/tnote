import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { FormTextarea } from "@/shared/components/ui/formTextarea";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { consultationFormAtom, selectedConsultationAtom } from "../(atoms)/useConsultationStore";
import { showAddConsultationModalAtom, showEditConsultationModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useConsultationCreate } from "../(hooks)/useConsultationCreate";
import { useConsultationDelete } from "../(hooks)/useConsultationDelete";
import { useConsultationTemplates } from "../(hooks)/useConsultationTemplates";
import { useConsultationUpdate } from "../(hooks)/useConsultationUpdate";
import ConsultationTemplateSelector from "./ConsultationTemplateSelector";

export default function ConsultationFormModal() {
  const [showAddModal, setShowAddModal] = useAtom(showAddConsultationModalAtom);
  const [showEditModal, setShowEditModal] = useAtom(showEditConsultationModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const selectedConsultation = useAtomValue(selectedConsultationAtom);
  const [form, setForm] = useAtom(consultationFormAtom);
  const { createConsultation, isCreating } = useConsultationCreate();
  const { updateConsultation, isUpdating } = useConsultationUpdate();
  const { deleteConsultation, isDeleting } = useConsultationDelete();
  const { templates, addTemplate, deleteTemplate } = useConsultationTemplates();
  const toast = useToast();

  const isEditMode = showEditModal;
  const showModal = showAddModal || showEditModal;
  const isSaving = isCreating || isUpdating;

  if (!showModal || !selectedStudent) return null;

  const handleClose = () => {
    if (isEditMode) {
      setShowEditModal(false);
    } else {
      setShowAddModal(false);
    }
  };

  const handleTemplateSelect = (title: string, content: string) => {
    setForm({
      ...form,
      title,
      content,
    });
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.info("제목과 상담 내용을 입력해 주세요.");
      return;
    }

    try {
      await createConsultation({
        studentId: selectedStudent.id,
        title: form.title,
        content: form.content,
      });
      toast.success("상담일지가 추가되었습니다.");
      setShowAddModal(false);
      setForm({ title: "", content: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "상담일지 추가에 실패했습니다.");
    }
  };

  const handleEdit = async () => {
    if (!selectedConsultation || !form.title.trim() || !form.content.trim()) {
      toast.info("제목과 상담 내용을 입력해 주세요.");
      return;
    }

    try {
      await updateConsultation({
        consultationId: selectedConsultation.id,
        studentId: selectedStudent.id,
        title: form.title,
        content: form.content,
      });
      toast.success("상담일지가 수정되었습니다.");
      setShowEditModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "상담일지 수정에 실패했습니다.");
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
      toast.success("상담일지가 삭제되었습니다.");
      setShowEditModal(false);
    } catch {
      toast.error("상담일지 삭제에 실패했습니다.");
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
      <div className="flex flex-col gap-spacing-400">
        <ConsultationTemplateSelector
          templates={templates}
          currentTitle={form.title}
          currentContent={form.content}
          onSelect={handleTemplateSelect}
          onSave={addTemplate}
          onDelete={deleteTemplate}
        />

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
