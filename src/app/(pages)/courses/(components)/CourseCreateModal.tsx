import { useAtom } from "jotai";
import { Button, FormInput, Modal } from "@/shared/components/ui";
import { courseNameAtom } from "../(atoms)/useFormStore";
import { showCreateModalAtom } from "../(atoms)/useModalStore";
import { useCourseCreate } from "../(hooks)/useCourseCreate";

export default function CourseCreateModal() {
  const [showModal, setShowModal] = useAtom(showCreateModalAtom);
  const [courseName, setCourseName] = useAtom(courseNameAtom);
  const { createCourse, isCreating } = useCourseCreate();

  const handleCreate = async () => {
    if (!courseName.trim()) {
      alert("수업 이름을 입력해주세요.");
      return;
    }

    try {
      await createCourse({ name: courseName });
      alert("수업이 생성되었습니다.");
      setShowModal(false);
      setCourseName("");
    } catch (error) {
      console.error("Create error:", error);
      alert(error instanceof Error ? error.message : "수업 생성에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        setCourseName("");
      }}
      title="수업 생성"
      footer={
        <>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setShowModal(false);
              setCourseName("");
            }}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleCreate}
            disabled={!courseName.trim()}
            isLoading={isCreating}
            loadingText="생성 중...">
            생성
          </Button>
        </>
      }>
      <FormInput
        label="수업 이름"
        type="text"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        placeholder="ex. [고2] 대수 심화반 화토"
        required
      />
    </Modal>
  );
}
