"use client";

import { useAtom } from "jotai";
import Link from "next/link";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
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
      alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
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
        <Header title="재시험 관리" subtitle="학생들의 재시험을 관리합니다" />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header
        title="재시험 관리"
        subtitle="학생들의 재시험을 관리합니다"
        action={
          <button
            onClick={handleAssignClick}
            className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            + 재시험 할당
          </button>
        }
      />

      {/* 필터 드롭다운 */}
      <div className="mb-spacing-400 flex flex-wrap gap-spacing-300">
        {/* 완료된 재시험 보기 토글 */}
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
            showCompleted
              ? "bg-solid-translucent-green text-solid-green"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          {showCompleted ? "완료된 재시험 숨기기" : "완료된 재시험 보기"}
        </button>

        {/* 상태 필터 */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
          <option value="all">전체 상태</option>
          <option value="pending">대기중</option>
          <option value="completed">완료</option>
          <option value="absent">결석</option>
        </select>

        {/* 반 필터 */}
        <select
          value={selectedCourse}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
          <option value="all">전체 반</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        {/* 시험 필터 */}
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          disabled={selectedCourse === "all"}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent disabled:cursor-not-allowed disabled:opacity-50">
          <option value="all">전체 시험</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          ))}
        </select>

        {/* 관리상태 필터 */}
        <select
          value={selectedManagementStatus}
          onChange={(e) => setSelectedManagementStatus(e.target.value as ManagementStatus | "all")}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
          <option value="all">전체 관리 상태</option>
          {managementStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* 날짜 필터 */}
        <input
          type="date"
          value={selectedDate === "all" ? "" : selectedDate}
          onChange={(e) => setSelectedDate(e.target.value || "all")}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
        />

        {/* 필터 초기화 버튼 */}
        {isFilterActive && (
          <button
            onClick={handleResetFilters}
            className="px-spacing-200 font-medium text-content-standard-tertiary text-label transition-colors hover:text-content-standard-primary">
            초기화
          </button>
        )}
      </div>

      {/* 반별 필터 버튼 */}
      {courses.length > 0 && (
        <div className="mb-spacing-400 flex flex-wrap gap-spacing-300">
          <button
            onClick={() => handleCourseChange("all")}
            className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
              selectedCourse === "all"
                ? "bg-core-accent text-solid-white"
                : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
            }`}>
            전체 반
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleCourseChange(course.id)}
              className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
                selectedCourse === course.id
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              {course.name}
            </button>
          ))}
        </div>
      )}

      {/* 검색 */}
      <div className="mb-spacing-600">
        <SearchInput
          placeholder="학생 이름 검색..."
          size="lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 재시험 목록 */}
      {isLoading ? (
        <LoadingComponent />
      ) : fetchedRetakes.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">재시험이 없습니다.</p>
        </div>
      ) : filteredRetakes.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">검색 결과가 없습니다.</p>
        </div>
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

      {/* 모달들 */}
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
