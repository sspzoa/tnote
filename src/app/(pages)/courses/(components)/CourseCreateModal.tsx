"use client";

import { useAtom } from "jotai";
import {
  courseDaysOfWeekAtom,
  courseEndDateAtom,
  courseNameAtom,
  courseStartDateAtom,
} from "../(atoms)/useFormStore";
import { showCreateModalAtom } from "../(atoms)/useModalStore";
import { useCourseCreate } from "../(hooks)/useCourseCreate";

export default function CourseCreateModal() {
  const [isOpen, setIsOpen] = useAtom(showCreateModalAtom);
  const [courseName, setCourseName] = useAtom(courseNameAtom);
  const [daysOfWeek, setDaysOfWeek] = useAtom(courseDaysOfWeekAtom);
  const [startDate, setStartDate] = useAtom(courseStartDateAtom);
  const [endDate, setEndDate] = useAtom(courseEndDateAtom);
  const { createCourse, isCreating } = useCourseCreate();

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const handleClose = () => {
    setIsOpen(false);
    setCourseName("");
    setDaysOfWeek([]);
    setStartDate("");
    setEndDate("");
  };

  const handleCreate = async () => {
    if (!courseName.trim()) {
      alert("수업 이름을 입력해주세요.");
      return;
    }

    try {
      await createCourse({
        name: courseName,
        startDate: startDate || null,
        endDate: endDate || null,
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : null,
      });
      alert("수업이 생성되었습니다.");
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "수업 생성에 실패했습니다.");
    }
  };

  const toggleDay = (index: number) => {
    const newDays = daysOfWeek.includes(index)
      ? daysOfWeek.filter((d) => d !== index)
      : [...daysOfWeek, index].sort();
    setDaysOfWeek(newDays);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="font-bold text-content-standard-primary text-heading">수업 생성</h2>
        </div>

        <div className="space-y-spacing-500 p-spacing-600">
          <div>
            <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
              수업 이름 <span className="text-core-status-negative">*</span>
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="ex. [고2] 대수 심화반 화토"
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
            />
          </div>

          <div>
            <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
              수업 요일
            </label>
            <div className="grid grid-cols-7 gap-spacing-200">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`rounded-radius-300 py-spacing-200 font-medium text-footnote transition-colors ${
                    daysOfWeek.includes(index)
                      ? "bg-core-accent text-solid-white"
                      : "border border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary"
                  }`}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-spacing-400">
            <div>
              <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                시작 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>
            <div>
              <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                종료 날짜
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={handleClose}
            className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !courseName.trim()}
            className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {isCreating ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
