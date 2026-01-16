"use client";

import { useAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { editDateAtom, postponeDateAtom, postponeNoteAtom } from "./(atoms)/useFormStore";
import {
  selectedStudentIdAtom,
  showAbsentModalAtom,
  showAssignModalAtom,
  showCompleteModalAtom,
  showEditDateModalAtom,
  showHistoryModalAtom,
  showManagementStatusModalAtom,
  showPostponeModalAtom,
  showStudentModalAtom,
} from "./(atoms)/useModalStore";
import {
  filterAtom,
  type ManagementStatus,
  openMenuIdAtom,
  retakesAtom,
  searchQueryAtom,
  selectedCourseAtom,
  selectedDateAtom,
  selectedExamAtom,
  selectedManagementStatusAtom,
  selectedRetakeAtom,
  showCompletedAtom,
} from "./(atoms)/useRetakesStore";
import ManagementStatusModal from "./(components)/ManagementStatusModal";
import RetakeAbsentModal from "./(components)/RetakeAbsentModal";
import RetakeAssignModal from "./(components)/RetakeAssignModal";
import RetakeCompleteModal from "./(components)/RetakeCompleteModal";
import RetakeEditDateModal from "./(components)/RetakeEditDateModal";
import RetakeHistoryModal from "./(components)/RetakeHistoryModal";
import RetakeList from "./(components)/RetakeList";
import RetakePostponeModal from "./(components)/RetakePostponeModal";
import StudentInfoModal from "./(components)/StudentInfoModal";
import { useCourses } from "./(hooks)/useCourses";
import { useExams } from "./(hooks)/useExams";
import { useRetakeDelete } from "./(hooks)/useRetakeDelete";
import { useRetakes } from "./(hooks)/useRetakes";

const managementStatusOptions: ManagementStatus[] = [
  "재시 안내 예정",
  "재시 안내 완료",
  "클리닉 1회 불참 연락 필요",
  "클리닉 1회 불참 연락 완료",
  "클리닉 2회 불참 연락 필요",
  "클리닉 2회 불참 연락 완료",
  "실장 집중 상담 필요",
  "실장 집중 상담 진행 중",
  "실장 집중 상담 완료",
];

export default function RetakesPage() {
  const [filter, setFilter] = useAtom(filterAtom);
  const [retakes] = useAtom(retakesAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedExam, setSelectedExam] = useAtom(selectedExamAtom);
  const [selectedManagementStatus, setSelectedManagementStatus] = useAtom(selectedManagementStatusAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [showCompleted, setShowCompleted] = useAtom(showCompletedAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [, setSelectedRetake] = useAtom(selectedRetakeAtom);
  const [, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [, setShowPostponeModal] = useAtom(showPostponeModalAtom);
  const [, setShowAbsentModal] = useAtom(showAbsentModalAtom);
  const [, setShowCompleteModal] = useAtom(showCompleteModalAtom);
  const [, setShowHistoryModal] = useAtom(showHistoryModalAtom);
  const [, setShowAssignModal] = useAtom(showAssignModalAtom);
  const [, setShowStudentModal] = useAtom(showStudentModalAtom);
  const [, setShowManagementStatusModal] = useAtom(showManagementStatusModalAtom);
  const [, setShowEditDateModal] = useAtom(showEditDateModalAtom);
  const [, setSelectedStudentId] = useAtom(selectedStudentIdAtom);
  const [, setPostponeDate] = useAtom(postponeDateAtom);
  const [, setPostponeNote] = useAtom(postponeNoteAtom);
  const [, setEditDate] = useAtom(editDateAtom);

  const { retakes: fetchedRetakes, isLoading, error, refetch } = useRetakes(filter);
  const { courses } = useCourses();
  const { exams } = useExams(selectedCourse === "all" ? null : selectedCourse);
  const { deleteRetake } = useRetakeDelete();

  const handlePostpone = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setPostponeDate("");
    setPostponeNote("");
    setShowPostponeModal(true);
    setOpenMenuId(null);
  };

  const handleAbsent = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowAbsentModal(true);
    setOpenMenuId(null);
  };

  const handleComplete = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowCompleteModal(true);
    setOpenMenuId(null);
  };

  const handleViewHistory = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowHistoryModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (retake: (typeof retakes)[number]) => {
    setOpenMenuId(null);
    if (!confirm(`${retake.student.name} 학생의 ${retake.exam.course.name} 재시험을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteRetake(retake.id);
      alert("재시험이 삭제되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "재시험 삭제에 실패했습니다.");
    }
  };

  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentModal(true);
  };

  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const handleManagementStatusChange = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setShowManagementStatusModal(true);
    setOpenMenuId(null);
  };

  const handleEditDate = (retake: (typeof retakes)[number]) => {
    setSelectedRetake(retake);
    setEditDate("");
    setShowEditDateModal(true);
    setOpenMenuId(null);
  };

  const handleActionSuccess = () => {
    refetch();
  };

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
  };

  const isFilterActive =
    filter !== "all" ||
    selectedCourse !== "all" ||
    selectedExam !== "all" ||
    selectedManagementStatus !== "all" ||
    searchQuery !== "" ||
    selectedDate !== "all";

  const filteredRetakes = fetchedRetakes
    .filter((retake) => showCompleted || retake.status !== "completed")
    .filter((retake) => selectedCourse === "all" || retake.exam.course.id === selectedCourse)
    .filter((retake) => selectedExam === "all" || retake.exam.id === selectedExam)
    .filter((retake) => selectedManagementStatus === "all" || retake.management_status === selectedManagementStatus)
    .filter((retake) => selectedDate === "all" || retake.current_scheduled_date === selectedDate)
    .filter((retake) => retake.student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (error) {
    return (
      <Container>
        <Header
          title="재시험 관리"
          subtitle="학생들의 재시험을 관리합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title="재시험 관리"
        subtitle="학생들의 재시험을 관리합니다"
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={<Button onClick={handleAssignClick}>+ 재시험 할당</Button>}
      />

      <div className="flex flex-col gap-spacing-600">
        <div className="flex flex-col gap-spacing-600">
          <div className="flex flex-col gap-spacing-300">
            <div className="flex flex-wrap gap-spacing-300">
              <FilterButton active={showCompleted} onClick={() => setShowCompleted(!showCompleted)} variant="toggle">
                {showCompleted ? "완료된 재시험 숨기기" : "완료된 재시험 보기"}
              </FilterButton>

              <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
                <option value="all">전체 상태</option>
                <option value="pending">대기중</option>
                <option value="completed">완료</option>
                <option value="absent">결석</option>
              </FilterSelect>

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

              <FilterSelect
                value={selectedManagementStatus}
                onChange={(e) => setSelectedManagementStatus(e.target.value as ManagementStatus | "all")}>
                <option value="all">전체 관리 상태</option>
                {managementStatusOptions.map((status) => (
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

        {isLoading ? (
          <LoadingComponent />
        ) : fetchedRetakes.length === 0 ? (
          <EmptyState message="재시험이 없습니다." />
        ) : filteredRetakes.length === 0 ? (
          <EmptyState message="검색 결과가 없습니다." />
        ) : (
          <RetakeList
            retakes={filteredRetakes}
            onViewStudent={handleViewStudent}
            onPostpone={handlePostpone}
            onAbsent={handleAbsent}
            onComplete={handleComplete}
            onViewHistory={handleViewHistory}
            onDelete={handleDelete}
            onManagementStatusChange={handleManagementStatusChange}
            onEditDate={handleEditDate}
          />
        )}
      </div>

      <RetakePostponeModal onSuccess={handleActionSuccess} />
      <RetakeAbsentModal onSuccess={handleActionSuccess} />
      <RetakeCompleteModal onSuccess={handleActionSuccess} />
      <RetakeHistoryModal onSuccess={handleActionSuccess} />
      <StudentInfoModal />
      <RetakeAssignModal onSuccess={handleActionSuccess} />
      <ManagementStatusModal onSuccess={handleActionSuccess} />
      <RetakeEditDateModal onSuccess={handleActionSuccess} />
    </Container>
  );
}
