"use client";

import { useAtom } from "jotai";
import { History, X } from "lucide-react";
import { useState } from "react";
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
  minIncompleteCountAtom,
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
import { useAllRetakeHistory } from "./(hooks)/useAllRetakeHistory";
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

const getActionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    assign: "할당",
    postpone: "연기",
    absent: "결석",
    complete: "완료",
    status_change: "상태 변경",
    management_status_change: "관리 상태 변경",
    note_update: "메모 수정",
    date_edit: "날짜 수정",
  };
  return labels[actionType] || actionType;
};

const getActionBadgeStyle = (actionType: string) => {
  if (actionType === "assign") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "postpone") return "bg-solid-translucent-blue text-solid-blue";
  if (actionType === "absent") return "bg-solid-translucent-red text-solid-red";
  if (actionType === "complete") return "bg-solid-translucent-green text-solid-green";
  if (actionType === "status_change") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "management_status_change") return "bg-solid-translucent-yellow text-solid-yellow";
  if (actionType === "date_edit") return "bg-solid-translucent-blue text-solid-blue";
  return "bg-components-fill-standard-secondary text-content-standard-secondary";
};

export default function RetakesPage() {
  const [filter, setFilter] = useAtom(filterAtom);
  const [retakes] = useAtom(retakesAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedExam, setSelectedExam] = useAtom(selectedExamAtom);
  const [selectedManagementStatus, setSelectedManagementStatus] = useAtom(selectedManagementStatusAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [showCompleted, setShowCompleted] = useAtom(showCompletedAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [minIncompleteCount, setMinIncompleteCount] = useAtom(minIncompleteCountAtom);
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

  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const { retakes: fetchedRetakes, isLoading, error, refetch } = useRetakes(filter);
  const { courses } = useCourses();
  const { exams } = useExams(selectedCourse === "all" ? null : selectedCourse);
  const { deleteRetake } = useRetakeDelete();
  const { history: allHistory, isLoading: historyLoading } = useAllRetakeHistory();

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
    setMinIncompleteCount(0);
  };

  const isFilterActive =
    filter !== "all" ||
    selectedCourse !== "all" ||
    selectedExam !== "all" ||
    selectedManagementStatus !== "all" ||
    searchQuery !== "" ||
    selectedDate !== "all" ||
    minIncompleteCount > 0;

  const incompleteCountByStudent = fetchedRetakes.reduce(
    (acc, retake) => {
      if (retake.status !== "completed") {
        acc[retake.student.id] = (acc[retake.student.id] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const filteredRetakes = fetchedRetakes
    .filter((retake) => showCompleted || retake.status !== "completed")
    .filter((retake) => selectedCourse === "all" || retake.exam.course.id === selectedCourse)
    .filter((retake) => selectedExam === "all" || retake.exam.id === selectedExam)
    .filter((retake) => selectedManagementStatus === "all" || retake.management_status === selectedManagementStatus)
    .filter((retake) => selectedDate === "all" || retake.current_scheduled_date === selectedDate)
    .filter((retake) => retake.student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(
      (retake) => minIncompleteCount === 0 || (incompleteCountByStudent[retake.student.id] || 0) >= minIncompleteCount,
    )
    .sort((a, b) => {
      if (minIncompleteCount > 0) {
        const nameCompare = a.student.name.localeCompare(b.student.name, "ko");
        if (nameCompare !== 0) return nameCompare;
        const dateA = a.current_scheduled_date || "";
        const dateB = b.current_scheduled_date || "";
        return dateA.localeCompare(dateB);
      }
      const dateA = a.current_scheduled_date || "";
      const dateB = b.current_scheduled_date || "";
      return dateA.localeCompare(dateB);
    });

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
        action={
          <div className="flex items-center gap-spacing-300">
            <Button
              variant="secondary"
              onClick={() => setShowHistoryPanel(true)}
              className="flex items-center gap-spacing-200">
              <History className="size-4" />
              최근 이력
              {allHistory.length > 0 && (
                <span className="rounded-full bg-core-accent px-spacing-200 text-footnote text-solid-white">
                  {allHistory.length}
                </span>
              )}
            </Button>
            <Button onClick={handleAssignClick}>+ 재시험 할당</Button>
          </div>
        }
      />

      <div className="flex flex-col gap-spacing-600">
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
                {managementStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                value={minIncompleteCount.toString()}
                onChange={(e) => setMinIncompleteCount(Number(e.target.value))}>
                <option value="0">미완료 개수</option>
                <option value="2">2개 이상</option>
                <option value="3">3개 이상</option>
                <option value="4">4개 이상</option>
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

      {showHistoryPanel && (
        <>
          <div
            className="fixed top-0 right-0 bottom-0 left-0 z-40 bg-solid-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHistoryPanel(false)}
          />

          <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-line-outline border-l bg-components-fill-standard-primary">
            <div className="flex items-center justify-between border-line-divider border-b px-spacing-600 py-spacing-500">
              <div>
                <h2 className="font-bold text-content-standard-primary text-heading">최근 이력</h2>
                <p className="text-content-standard-tertiary text-label">최근 50건</p>
              </div>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="rounded-radius-200 p-spacing-200 transition-all duration-150 hover:bg-core-accent-translucent hover:text-core-accent">
                <X className="size-5 text-content-standard-tertiary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-spacing-900">
                  <div className="mb-spacing-300 size-8 animate-spin rounded-full border-2 border-core-accent border-t-solid-transparent" />
                  <span className="text-content-standard-tertiary text-label">로딩중...</span>
                </div>
              ) : allHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-spacing-900">
                  <div className="mb-spacing-300 flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
                    <History className="size-6 text-core-accent" />
                  </div>
                  <span className="text-content-standard-tertiary text-label">이력이 없습니다.</span>
                </div>
              ) : (
                <div className="divide-y divide-line-divider">
                  {allHistory.map((item) => {
                    const createdAt = new Date(item.created_at);
                    const dateStr = createdAt.toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={item.id}
                        className="px-spacing-600 py-spacing-400 transition-colors hover:bg-components-fill-standard-secondary">
                        <div className="mb-spacing-200 flex items-start justify-between gap-spacing-300">
                          <div className="min-w-0 flex-1">
                            <div className="mb-spacing-50 flex items-center gap-spacing-200">
                              <span className="font-semibold text-body text-content-standard-primary">
                                {item.retake.student.name}
                              </span>
                              <span
                                className={`shrink-0 rounded-radius-200 px-spacing-200 py-spacing-50 font-semibold text-footnote ${getActionBadgeStyle(item.action_type)}`}>
                                {getActionLabel(item.action_type)}
                              </span>
                            </div>
                            <div className="truncate text-content-standard-secondary text-label">
                              {item.retake.exam.course.name} · {item.retake.exam.name} {item.retake.exam.exam_number}
                              회차
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-content-standard-tertiary text-footnote">{dateStr}</div>
                            <div className="text-content-standard-quaternary text-footnote">{timeStr}</div>
                            {item.performed_by && (
                              <div className="text-content-standard-quaternary text-footnote">
                                {item.performed_by.name}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.action_type === "assign" && (
                          <div className="flex items-center gap-spacing-200 rounded-radius-200 bg-solid-translucent-purple px-spacing-300 py-spacing-200">
                            <span className="text-footnote text-solid-purple">
                              {item.new_date ? `예정일: ${item.new_date}` : "예정일 미지정"}
                            </span>
                          </div>
                        )}

                        {(item.action_type === "postpone" ||
                          item.action_type === "date_edit" ||
                          item.action_type === "complete") &&
                          item.new_date && (
                            <div className="flex items-center gap-spacing-200 rounded-radius-200 bg-components-fill-standard-secondary px-spacing-300 py-spacing-200">
                              <span className="text-content-standard-tertiary text-footnote">
                                {item.previous_date || "미지정"}
                              </span>
                              <span className="text-content-standard-quaternary text-footnote">→</span>
                              <span className="font-medium text-content-standard-primary text-footnote">
                                {item.new_date}
                              </span>
                            </div>
                          )}

                        {item.action_type === "management_status_change" && item.new_management_status && (
                          <div className="flex items-center gap-spacing-200 rounded-radius-200 bg-solid-translucent-yellow px-spacing-300 py-spacing-200">
                            <span className="text-footnote text-solid-yellow">
                              {item.previous_management_status} → {item.new_management_status}
                            </span>
                          </div>
                        )}

                        {item.note && (
                          <div className="mt-spacing-200 truncate rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-300 py-spacing-200 text-content-standard-secondary text-footnote italic">
                            "{item.note}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
