"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { showEndedCoursesAtom } from "../(atoms)/useCoursesStore";

export default function CourseFilters() {
  const [showEndedCourses, setShowEndedCourses] = useAtom(showEndedCoursesAtom);

  return (
    <div className="flex flex-col gap-spacing-400 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
      <span className="block font-medium text-content-standard-tertiary text-label">필터</span>

      <div className="flex flex-wrap items-center gap-spacing-300">
        <FilterButton active={showEndedCourses} onClick={() => setShowEndedCourses(!showEndedCourses)} variant="toggle">
          {showEndedCourses ? "종료된 수업 숨기기" : "종료된 수업 보기"}
        </FilterButton>
      </div>
    </div>
  );
}
