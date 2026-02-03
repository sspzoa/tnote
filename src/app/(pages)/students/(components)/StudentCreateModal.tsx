import { useAtom } from "jotai";
import { Button, FormInput, Modal } from "@/shared/components/ui";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";
import { createFormAtom } from "../(atoms)/useFormStore";
import { showCreateModalAtom } from "../(atoms)/useModalStore";
import { useStudentCreate } from "../(hooks)/useStudentCreate";

export default function StudentCreateModal() {
  const [showModal, setShowModal] = useAtom(showCreateModalAtom);
  const [form, setForm] = useAtom(createFormAtom);
  const { createStudent, isCreating } = useStudentCreate();

  const handleCreate = async () => {
    try {
      await createStudent({
        name: form.name,
        phoneNumber: removePhoneHyphens(form.phoneNumber),
        parentPhoneNumber: form.parentPhoneNumber ? removePhoneHyphens(form.parentPhoneNumber) : null,
        school: form.school || null,
        branch: form.branch || null,
        birthYear: form.birthYear || null,
      });
      alert("학생이 추가되었습니다.");
      setShowModal(false);
      setForm({ name: "", phoneNumber: "", parentPhoneNumber: "", school: "", branch: "", birthYear: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "학생 추가에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="학생 추가"
      subtitle="새로운 학생을 추가합니다. 비밀번호는 전화번호로 자동 설정됩니다."
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleCreate}
            disabled={
              !form.name ||
              !form.phoneNumber ||
              !form.parentPhoneNumber ||
              !form.school ||
              !form.branch ||
              !form.birthYear
            }
            isLoading={isCreating}
            loadingText="추가 중...">
            추가
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-400">
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
          placeholder="01012345678"
          required
        />

        <FormInput
          label="부모님 전화번호"
          type="tel"
          value={form.parentPhoneNumber}
          onChange={(e) => setForm({ ...form, parentPhoneNumber: e.target.value })}
          placeholder="01012345678"
          required
        />

        <FormInput
          label="학교"
          type="text"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          required
        />

        <FormInput
          label="지점"
          type="text"
          value={form.branch}
          onChange={(e) => setForm({ ...form, branch: e.target.value })}
          placeholder="러셀부천"
          required
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
              required
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
