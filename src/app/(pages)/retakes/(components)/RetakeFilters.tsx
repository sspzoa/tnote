"use client";

import { useAtom } from "jotai";
import { X } from "lucide-react";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { FilterRow } from "@/shared/components/ui/toolbar";
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
    <div className="flex flex-col gap-3">
      <FilterRow>
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
          className="inline-flex h-8 cursor-pointer rounded-md border border-input bg-background px-3 font-medium text-foreground text-sm outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </FilterRow>

      <FilterRow>
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
      </FilterRow>

      <FilterRow>
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
      </FilterRow>

      <FilterRow>
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
