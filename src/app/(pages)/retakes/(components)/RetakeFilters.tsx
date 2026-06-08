"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import {
  filterAtom,
  minAbsentCountAtom,
  minIncompleteCountAtom,
  minPostponeAbsentCountAtom,
  minPostponeCountAtom,
  minTotalRetakeCountAtom,
  searchQueryAtom,
  selectedCourseAtom,
  selectedDateAtom,
  selectedExamAtom,
  selectedManagementStatusAtom,
  showCompletedAtom,
} from "../(atoms)/useRetakesStore";
import { useCourses } from "../(hooks)/useCourses";
import { useExams } from "../(hooks)/useExams";

export default function RetakeFilters() {
  const [filter, setFilter] = useAtom(filterAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedExam, setSelectedExam] = useAtom(selectedExamAtom);
  const [selectedManagementStatus, setSelectedManagementStatus] = useAtom(selectedManagementStatusAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [showCompleted, setShowCompleted] = useAtom(showCompletedAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [minIncompleteCount, setMinIncompleteCount] = useAtom(minIncompleteCountAtom);
  const [minTotalRetakeCount, setMinTotalRetakeCount] = useAtom(minTotalRetakeCountAtom);
  const [minPostponeCount, setMinPostponeCount] = useAtom(minPostponeCountAtom);
  const [minAbsentCount, setMinAbsentCount] = useAtom(minAbsentCountAtom);
  const [minPostponeAbsentCount, setMinPostponeAbsentCount] = useAtom(minPostponeAbsentCountAtom);

  const { courses } = useCourses();
  const { exams } = useExams(selectedCourse === "all" ? null : selectedCourse);
  const { statuses: managementStatuses } = useManagementStatuses();

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedExam("all");
  };

  const handleResetFilters = () => {
    setFilter("all");
    setSelectedCourse("all");
    setSelectedExam("all");
    setSelectedManagementStatus("all");
    setSearchQuery("");
    setSelectedDate("all");
    setMinIncompleteCount(0);
    setMinTotalRetakeCount(0);
    setMinPostponeCount(0);
    setMinAbsentCount(0);
    setMinPostponeAbsentCount(0);
  };

  const isFilterActive =
    filter !== "all" ||
    selectedCourse !== "all" ||
    selectedExam !== "all" ||
    selectedManagementStatus !== "all" ||
    searchQuery !== "" ||
    selectedDate !== "all" ||
    minIncompleteCount > 0 ||
    minTotalRetakeCount > 0 ||
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
                { value: "pending", label: "대기중" },
                { value: "completed", label: "완료" },
                { value: "absent", label: "결석" },
              ]}
            />

            <FilterSelect
              value={selectedManagementStatus}
              onValueChange={setSelectedManagementStatus}
              options={[
                { value: "all", label: "전체 관리 상태" },
                ...managementStatuses.map((status) => ({ value: status.name, label: status.name })),
              ]}
            />

            <input
              type="date"
              value={selectedDate === "all" ? "" : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || "all")}
              className="cursor-pointer rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground text-sm transition-all duration-150 hover:border-primary/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              value={minIncompleteCount.toString()}
              onValueChange={(value) => setMinIncompleteCount(Number(value))}
              options={[
                { value: "0", label: "미완료 재시험" },
                { value: "2", label: "2개 이상" },
                { value: "3", label: "3개 이상" },
                { value: "4", label: "4개 이상" },
              ]}
            />

            <FilterSelect
              value={minTotalRetakeCount.toString()}
              onValueChange={(value) => setMinTotalRetakeCount(Number(value))}
              options={[
                { value: "0", label: "누적 재시험" },
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
                { value: "0", label: "누적 결석" },
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
              value={selectedExam}
              onValueChange={setSelectedExam}
              disabled={selectedCourse === "all"}
              options={[
                { value: "all", label: "전체 시험" },
                ...exams.map((exam) => ({ value: exam.id, label: exam.name })),
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
