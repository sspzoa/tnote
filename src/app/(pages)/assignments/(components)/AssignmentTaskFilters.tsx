"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  filterAtom,
  minAbsentCountAtom,
  minIncompleteCountAtom,
  minPostponeAbsentCountAtom,
  minPostponeCountAtom,
  minTotalCountAtom,
  searchQueryAtom,
  selectedAssignmentIdAtom,
  selectedCourseAtom,
  selectedDateAtom,
  showCompletedAtom,
} from "../(atoms)/useAssignmentTaskStore";
import { useAssignmentsForFilter } from "../(hooks)/useAssignmentsForFilter";
import { useCourses } from "../(hooks)/useCourses";

export default function AssignmentTaskFilters() {
  const [filter, setFilter] = useAtom(filterAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedAssignmentId, setSelectedAssignmentId] = useAtom(selectedAssignmentIdAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [showCompleted, setShowCompleted] = useAtom(showCompletedAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [minIncompleteCount, setMinIncompleteCount] = useAtom(minIncompleteCountAtom);
  const [minTotalCount, setMinTotalCount] = useAtom(minTotalCountAtom);
  const [minPostponeCount, setMinPostponeCount] = useAtom(minPostponeCountAtom);
  const [minAbsentCount, setMinAbsentCount] = useAtom(minAbsentCountAtom);
  const [minPostponeAbsentCount, setMinPostponeAbsentCount] = useAtom(minPostponeAbsentCountAtom);

  const { courses } = useCourses();
  const { assignments } = useAssignmentsForFilter(selectedCourse === "all" ? null : selectedCourse);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedAssignmentId("all");
  };

  const handleResetFilters = () => {
    setFilter("all");
    setSelectedCourse("all");
    setSelectedAssignmentId("all");
    setSearchQuery("");
    setSelectedDate("all");
    setMinIncompleteCount(0);
    setMinTotalCount(0);
    setMinPostponeCount(0);
    setMinAbsentCount(0);
    setMinPostponeAbsentCount(0);
  };

  const isFilterActive =
    filter !== "all" ||
    selectedCourse !== "all" ||
    selectedAssignmentId !== "all" ||
    searchQuery !== "" ||
    selectedDate !== "all" ||
    minIncompleteCount > 0 ||
    minTotalCount > 0 ||
    minPostponeCount > 0 ||
    minAbsentCount > 0 ||
    minPostponeAbsentCount > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted-foreground text-sm">필터</span>
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="font-medium text-muted-foreground text-xs transition-all duration-150 hover:text-primary">
              초기화
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterButton active={showCompleted} onClick={() => setShowCompleted(!showCompleted)} variant="toggle">
              {showCompleted ? "완료 숨기기" : "완료 보기"}
            </FilterButton>

            <FilterSelect
              value={filter}
              onValueChange={(value) => setFilter(value as typeof filter)}
              options={[
                { value: "all", label: "전체 상태" },
                { value: "pending", label: "검사예정" },
                { value: "absent", label: "결석" },
                { value: "insufficient", label: "미흡" },
                { value: "not_submitted", label: "미제출" },
                { value: "completed", label: "완료" },
              ]}
            />

            <input
              type="date"
              value={selectedDate === "all" ? "" : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || "all")}
              className="cursor-pointer rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground text-sm transition-all duration-150 hover:border-primary/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={minIncompleteCount.toString()}
              onValueChange={(value) => setMinIncompleteCount(Number(value))}
              options={[
                { value: "0", label: "미완료" },
                { value: "2", label: "2개 이상" },
                { value: "3", label: "3개 이상" },
                { value: "4", label: "4개 이상" },
              ]}
            />

            <FilterSelect
              value={minTotalCount.toString()}
              onValueChange={(value) => setMinTotalCount(Number(value))}
              options={[
                { value: "0", label: "누적 과제" },
                { value: "2", label: "2회 이상" },
                { value: "3", label: "3회 이상" },
                { value: "4", label: "4회 이상" },
                { value: "5", label: "5회 이상" },
              ]}
            />

            <FilterSelect
              value={minPostponeCount.toString()}
              onValueChange={(value) => setMinPostponeCount(Number(value))}
              options={[
                { value: "0", label: "누적 연기" },
                { value: "1", label: "1회 이상" },
                { value: "2", label: "2회 이상" },
                { value: "3", label: "3회 이상" },
              ]}
            />

            <FilterSelect
              value={minAbsentCount.toString()}
              onValueChange={(value) => setMinAbsentCount(Number(value))}
              options={[
                { value: "0", label: "누적 미제출" },
                { value: "1", label: "1회 이상" },
                { value: "2", label: "2회 이상" },
                { value: "3", label: "3회 이상" },
              ]}
            />

            <FilterSelect
              value={minPostponeAbsentCount.toString()}
              onValueChange={(value) => setMinPostponeAbsentCount(Number(value))}
              options={[
                { value: "0", label: "누적 연기+결석" },
                { value: "2", label: "2회 이상" },
                { value: "3", label: "3회 이상" },
                { value: "4", label: "4회 이상" },
                { value: "5", label: "5회 이상" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterButton active={selectedCourse === "all"} onClick={() => handleCourseChange("all")}>
              전체
            </FilterButton>
            {courses.map((course) => (
              <FilterButton
                key={course.id}
                active={selectedCourse === course.id}
                onClick={() => handleCourseChange(course.id)}>
                {course.name}
              </FilterButton>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={selectedCourse}
              onValueChange={handleCourseChange}
              options={[
                { value: "all", label: "전체 반" },
                ...courses.map((course) => ({ value: course.id, label: course.name })),
              ]}
            />

            <FilterSelect
              value={selectedAssignmentId}
              onValueChange={setSelectedAssignmentId}
              disabled={selectedCourse === "all"}
              options={[
                { value: "all", label: "전체 과제" },
                ...assignments.map((assignment) => ({ value: assignment.id, label: assignment.name })),
              ]}
            />
          </div>
        </div>
      </div>

      <SearchInput
        placeholder="학생 검색..."
        size="lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
