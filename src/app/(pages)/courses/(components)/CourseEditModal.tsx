"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { DayOfWeekPicker } from "@/shared/components/ui/dayOfWeekPicker";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { selectedCourseAtom } from "../(atoms)/useCoursesStore";
import { courseDaysOfWeekAtom, courseEndDateAtom, courseNameAtom, courseStartDateAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom } from "../(atoms)/useModalStore";
import { useCourseUpdate } from "../(hooks)/useCourseUpdate";

export default function CourseEditModal() {
  const [isOpen, setIsOpen] = useAtom(showEditModalAtom);
  const [selectedCourse] = useAtom(selectedCourseAtom);
  const [courseName, setCourseName] = useAtom(courseNameAtom);
  const [daysOfWeek, setDaysOfWeek] = useAtom(courseDaysOfWeekAtom);
  const [startDate, setStartDate] = useAtom(courseStartDateAtom);
  const [endDate, setEndDate] = useAtom(courseEndDateAtom);
  const { updateCourse, isUpdating } = useCourseUpdate();
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedCourse || !courseName.trim()) {
      toast.info("수업 이름을 입력해 주세요.");
      return;
    }

    try {
      await updateCourse({
        id: selectedCourse.id,
        name: courseName,
        startDate: startDate || null,
        endDate: endDate || null,
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : null,
      });
      toast.success("수업이 수정되었습니다.");
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수업 수정에 실패했습니다.");
    }
  };

  if (!selectedCourse) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="수업 수정"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleEdit} disabled={isUpdating || !courseName.trim()} className="flex-1">
            {isUpdating ? "저장 중..." : "저장"}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <FormInput label="수업 이름" required value={courseName} onChange={(e) => setCourseName(e.target.value)} />

        <DayOfWeekPicker label="수업 요일" selectedDays={daysOfWeek} onChange={setDaysOfWeek} />

        <div className="grid grid-cols-2 gap-spacing-400">
          <FormInput label="시작 날짜" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <FormInput label="종료 날짜" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
