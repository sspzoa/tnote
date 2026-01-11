import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
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
      alert("제목과 상담 내용을 입력해주세요.");
      return;
    }

    try {
      await createConsultation({
        studentId: selectedStudent.id,
        consultationDate: form.date,
        title: form.title,
        content: form.content,
      });
      alert("상담일지가 추가되었습니다.");
      setShowAddModal(false);
      setForm({ date: new Date().toISOString().split("T")[0], title: "", content: "" });
      setIsNewStudentConsultation(false);
    } catch (error) {
      console.error("Add consultation error:", error);
      alert(error instanceof Error ? error.message : "상담일지 추가에 실패했습니다.");
    }
  };

  const handleEdit = async () => {
    if (!selectedConsultation || !form.title.trim() || !form.content.trim()) {
      alert("제목과 상담 내용을 입력해주세요.");
      return;
    }

    try {
      await updateConsultation({
        consultationId: selectedConsultation.id,
        studentId: selectedStudent.id,
        consultationDate: form.date,
        title: form.title,
        content: form.content,
      });
      alert("상담일지가 수정되었습니다.");
      setShowEditModal(false);
    } catch (error) {
      console.error("Edit consultation error:", error);
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
    } catch (error) {
      console.error("Delete consultation error:", error);
      alert("상담일지 삭제에 실패했습니다.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
      <div
        className="w-full max-w-2xl rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="font-bold text-content-standard-primary text-heading">
            {isEditMode ? "상담일지 수정" : "상담일지 추가"}
          </h2>
          {!isEditMode && (
            <p className="mt-spacing-100 text-content-standard-secondary text-label">
              {selectedStudent.name} 학생의 상담일지를 작성합니다
            </p>
          )}
        </div>

        <div className="space-y-spacing-400 p-spacing-600">
          {!isEditMode && (
            <div className="flex items-center gap-spacing-300">
              <input
                type="checkbox"
                id="newStudentConsultation"
                checked={isNewStudentConsultation}
                onChange={(e) => handleNewStudentCheckbox(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-line-outline text-core-accent transition-all focus:ring-2 focus:ring-core-accent-translucent"
              />
              <label
                htmlFor="newStudentConsultation"
                className="cursor-pointer font-semibold text-body text-content-standard-primary">
                신규생 상담 (템플릿 자동 입력)
              </label>
            </div>
          )}

          <div>
            <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
              상담 날짜 <span className="text-core-status-negative">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
            />
          </div>

          <div>
            <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
              제목 <span className="text-core-status-negative">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="상담 제목을 입력하세요"
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
            />
          </div>

          <div>
            <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
              상담 내용 <span className="text-core-status-negative">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              placeholder="상담 내용을 입력하세요"
              className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
            />
          </div>
        </div>

        <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={handleClose}
            className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          {isEditMode && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 rounded-radius-300 bg-core-status-negative px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          )}
          <button
            onClick={isEditMode ? handleEdit : handleAdd}
            disabled={isSaving || !form.title.trim() || !form.content.trim()}
            className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "저장 중..." : isEditMode ? "저장" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
