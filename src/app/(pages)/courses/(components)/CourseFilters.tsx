"use client";

import { useAtom } from "jotai";
import { X } from "lucide-react";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterRow } from "@/shared/components/ui/toolbar";
import { showEndedCoursesAtom } from "../(atoms)/useCoursesStore";

export default function CourseFilters() {
  const [showEndedCourses, setShowEndedCourses] = useAtom(showEndedCoursesAtom);

  const isFilterActive = showEndedCourses;

  const handleResetFilters = () => {
    setShowEndedCourses(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <FilterRow>
        <FilterButton active={showEndedCourses} onClick={() => setShowEndedCourses(!showEndedCourses)} variant="toggle">
          {showEndedCourses ? "종료된 수업 숨기기" : "종료된 수업 보기"}
        </FilterButton>
      </FilterRow>

      {isFilterActive && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex w-fit items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground">
          <X className="size-3" />
          필터 초기화
        </button>
      )}
    </div>
  );
}
