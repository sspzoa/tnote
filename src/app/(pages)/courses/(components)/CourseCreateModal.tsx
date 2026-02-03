"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { DayOfWeekPicker } from "@/shared/components/ui/dayOfWeekPicker";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { courseDaysOfWeekAtom, courseEndDateAtom, courseNameAtom, courseStartDateAtom } from "../(atoms)/useFormStore";
import { showCreateModalAtom } from "../(atoms)/useModalStore";
import { useCourseCreate } from "../(hooks)/useCourseCreate";

export default function CourseCreateModal() {
  const [isOpen, setIsOpen] = useAtom(showCreateModalAtom);
  const [courseName, setCourseName] = useAtom(courseNameAtom);
  const [daysOfWeek, setDaysOfWeek] = useAtom(courseDaysOfWeekAtom);
  const [startDate, setStartDate] = useAtom(courseStartDateAtom);
  const [endDate, setEndDate] = useAtom(courseEndDateAtom);
  const { createCourse, isCreating } = useCourseCreate();
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setCourseName("");
    setDaysOfWeek([]);
    setStartDate("");
    setEndDate("");
  };

  const handleCreate = async () => {
    if (!courseName.trim()) {
      toast.info("수업 이름을 입력해 주세요.");
      return;
    }

    try {
      await createCourse({
        name: courseName,
        startDate: startDate || null,
        endDate: endDate || null,
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : null,
      });
      toast.success("수업이 생성되었습니다.");
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수업 생성에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="수업 생성"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !courseName.trim()} className="flex-1">
            {isCreating ? "생성 중..." : "생성"}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <FormInput
          label="수업 이름"
          required
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="ex. [고2] 대수 심화반 화토"
        />

        <DayOfWeekPicker label="수업 요일" selectedDays={daysOfWeek} onChange={setDaysOfWeek} />

        <div className="grid grid-cols-2 gap-spacing-400">
          <FormInput label="시작 날짜" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <FormInput label="종료 날짜" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
