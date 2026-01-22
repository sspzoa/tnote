"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  filterAtom,
  type ManagementStatus,
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

const MANAGEMENT_STATUS_OPTIONS: ManagementStatus[] = [
  "재시 안내 예정",
  "재시 안내 완료",
  "재시 날짜 확답 완료",
  "클리닉 1회 불참 연락 필요",
  "클리닉 1회 불참 연락 완료",
  "클리닉 2회 불참 연락 필요",
  "클리닉 2회 불참 연락 완료",
  "실장 집중 상담 필요",
  "실장 집중 상담 진행 중",
  "실장 집중 상담 완료",
];

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
    <div className="flex flex-col gap-spacing-600">
      <div className="flex flex-col gap-spacing-300">
        <div className="flex flex-wrap items-center gap-spacing-300">
          <FilterButton active={showCompleted} onClick={() => setShowCompleted(!showCompleted)} variant="toggle">
            {showCompleted ? "완료된 재시험 숨기기" : "완료된 재시험 보기"}
          </FilterButton>

          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="completed">완료</option>
            <option value="absent">결석</option>
          </FilterSelect>

          <FilterSelect
            value={selectedManagementStatus}
            onChange={(e) => setSelectedManagementStatus(e.target.value as ManagementStatus | "all")}>
            <option value="all">전체 관리 상태</option>
            {MANAGEMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>

          <input
            type="date"
            value={selectedDate === "all" ? "" : selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || "all")}
            className="cursor-pointer rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all duration-150 hover:border-core-accent/30 focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
          />

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="px-spacing-200 font-medium text-content-standard-tertiary text-label transition-all duration-150 hover:text-core-accent">
              초기화
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-spacing-300">
          <FilterSelect
            value={minIncompleteCount.toString()}
            onChange={(e) => setMinIncompleteCount(Number(e.target.value))}>
            <option value="0">미완료 재시험</option>
            <option value="2">2개 이상</option>
            <option value="3">3개 이상</option>
            <option value="4">4개 이상</option>
          </FilterSelect>

          <FilterSelect
            value={minTotalRetakeCount.toString()}
            onChange={(e) => setMinTotalRetakeCount(Number(e.target.value))}>
            <option value="0">누적 재시험</option>
            <option value="2">2회 이상</option>
            <option value="3">3회 이상</option>
            <option value="4">4회 이상</option>
            <option value="5">5회 이상</option>
          </FilterSelect>

          <FilterSelect
            value={minPostponeCount.toString()}
            onChange={(e) => setMinPostponeCount(Number(e.target.value))}>
            <option value="0">누적 연기</option>
            <option value="1">1회 이상</option>
            <option value="2">2회 이상</option>
            <option value="3">3회 이상</option>
          </FilterSelect>

          <FilterSelect value={minAbsentCount.toString()} onChange={(e) => setMinAbsentCount(Number(e.target.value))}>
            <option value="0">누적 결석</option>
            <option value="1">1회 이상</option>
            <option value="2">2회 이상</option>
            <option value="3">3회 이상</option>
          </FilterSelect>

          <FilterSelect
            value={minPostponeAbsentCount.toString()}
            onChange={(e) => setMinPostponeAbsentCount(Number(e.target.value))}>
            <option value="0">누적 연기+결석</option>
            <option value="2">2회 이상</option>
            <option value="3">3회 이상</option>
            <option value="4">4회 이상</option>
            <option value="5">5회 이상</option>
          </FilterSelect>
        </div>

        <div className="flex flex-wrap items-center gap-spacing-300">
          <FilterSelect value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
            <option value="all">전체 반</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={selectedCourse === "all"}>
            <option value="all">전체 시험</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </FilterSelect>
        </div>

        {courses.length > 0 && (
          <div className="flex flex-wrap gap-spacing-300">
            <FilterButton active={selectedCourse === "all"} onClick={() => handleCourseChange("all")}>
              전체 반
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
        )}
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
