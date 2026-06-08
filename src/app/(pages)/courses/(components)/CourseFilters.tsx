"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { showEndedCoursesAtom } from "../(atoms)/useCoursesStore";

export default function CourseFilters() {
  const [showEndedCourses, setShowEndedCourses] = useAtom(showEndedCoursesAtom);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <span className="block font-medium text-muted-foreground text-sm">필터</span>

      <div className="flex flex-wrap items-center gap-3">
        <FilterButton active={showEndedCourses} onClick={() => setShowEndedCourses(!showEndedCourses)} variant="toggle">
          {showEndedCourses ? "종료된 수업 숨기기" : "종료된 수업 보기"}
        </FilterButton>
      </div>
    </div>
  );
}
