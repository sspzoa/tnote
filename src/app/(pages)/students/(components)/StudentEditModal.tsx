import { useAtom, useAtomValue } from "jotai";
import { Button, FormInput, Modal } from "@/shared/components/ui";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";
import { editFormAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentUpdate } from "../(hooks)/useStudentUpdate";

export default function StudentEditModal() {
  const [showModal, setShowModal] = useAtom(showEditModalAtom);
  const [form, setForm] = useAtom(editFormAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const { updateStudent, isUpdating } = useStudentUpdate();

  if (!selectedStudent) return null;

  const handleSave = async () => {
    try {
      await updateStudent({
        id: selectedStudent.id,
        name: form.name,
        phoneNumber: removePhoneHyphens(form.phoneNumber),
        parentPhoneNumber: form.parentPhoneNumber ? removePhoneHyphens(form.parentPhoneNumber) : null,
        school: form.school || null,
        branch: form.branch || null,
        birthYear: form.birthYear ? Number.parseInt(form.birthYear) : null,
      });
      alert("학생 정보가 수정되었습니다.");
      setShowModal(false);
    } catch {
      alert("정보 수정에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="학생 정보 수정"
      subtitle={`${selectedStudent.name} 학생의 정보를 수정합니다`}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={!form.name || !form.phoneNumber}
            isLoading={isUpdating}
            loadingText="저장 중...">
            저장
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        <FormInput
          label="이름"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <FormInput
          label="전화번호"
          type="tel"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          required
        />

        <FormInput
          label="부모님 전화번호"
          type="tel"
          value={form.parentPhoneNumber}
          onChange={(e) => setForm({ ...form, parentPhoneNumber: e.target.value })}
        />

        <FormInput
          label="학교"
          type="text"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
        />

        <FormInput
          label="지점"
          type="text"
          value={form.branch}
          onChange={(e) => setForm({ ...form, branch: e.target.value })}
          placeholder="러셀부천"
        />

        <div className="flex items-end gap-spacing-200">
          <div className="flex-1">
            <FormInput
              label="출생년도"
              type="number"
              min="1900"
              max="2100"
              value={form.birthYear}
              onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
              placeholder="2010"
            />
          </div>
          <div className="flex gap-spacing-100">
            {(["고1", "고2", "고3"] as const).map((grade) => {
              const gradeNumber = Number.parseInt(grade[1]) + 9;
              const birthYear = new Date().getFullYear() - (gradeNumber + 7) + 1;
              const isActive = form.birthYear === birthYear.toString();
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setForm({ ...form, birthYear: birthYear.toString() })}
                  className={`rounded-radius-300 border px-spacing-300 py-spacing-300 font-medium text-body transition-colors ${
                    isActive
                      ? "border-core-accent bg-core-accent text-solid-white"
                      : "border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
                  }`}>
                  {grade}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
