import { useAtom, useAtomValue } from "jotai";
import { Button, FormInput, Modal } from "@/shared/components/ui";
import { selectedCourseAtom } from "../(atoms)/useCoursesStore";
import { courseNameAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom } from "../(atoms)/useModalStore";
import { useCourseUpdate } from "../(hooks)/useCourseUpdate";

export default function CourseEditModal() {
  const [showModal, setShowModal] = useAtom(showEditModalAtom);
  const [courseName, setCourseName] = useAtom(courseNameAtom);
  const selectedCourse = useAtomValue(selectedCourseAtom);
  const { updateCourse, isUpdating } = useCourseUpdate();

  if (!selectedCourse) return null;

  const handleEdit = async () => {
    if (!courseName.trim()) {
      alert("수업 이름을 입력해주세요.");
      return;
    }

    try {
      await updateCourse({ id: selectedCourse.id, name: courseName });
      alert("수업이 수정되었습니다.");
      setShowModal(false);
    } catch (error) {
      console.error("Edit error:", error);
      alert("수업 수정에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="수업 수정"
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleEdit}
            disabled={!courseName.trim()}
            isLoading={isUpdating}
            loadingText="저장 중...">
            저장
          </Button>
        </>
      }>
      <FormInput
        label="수업 이름"
        type="text"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        required
      />
    </Modal>
  );
}
