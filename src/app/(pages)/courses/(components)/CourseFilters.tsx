"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterBar, FilterRow } from "@/shared/components/ui/toolbar";
import { showEndedCoursesAtom } from "../(atoms)/useCoursesStore";

export default function CourseFilters() {
  const [showEndedCourses, setShowEndedCourses] = useAtom(showEndedCoursesAtom);

  return (
    <FilterBar label="필터">
      <FilterRow>
        <FilterButton active={showEndedCourses} onClick={() => setShowEndedCourses(!showEndedCourses)} variant="toggle">
          {showEndedCourses ? "종료된 수업 숨기기" : "종료된 수업 보기"}
        </FilterButton>
      </FilterRow>
    </FilterBar>
  );
}
