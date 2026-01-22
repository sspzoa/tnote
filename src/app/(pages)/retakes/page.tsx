"use client";

import { useAtom } from "jotai";
import { History } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
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
  minAbsentCountAtom,
  minIncompleteCountAtom,
  minPostponeAbsentCountAtom,
  minPostponeCountAtom,
  minTotalRetakeCountAtom,
  openMenuIdAtom,
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
import RetakeFilters from "./(components)/RetakeFilters";
import RetakeHistoryModal from "./(components)/RetakeHistoryModal";
import RetakeHistoryPanel from "./(components)/RetakeHistoryPanel";
import RetakeList from "./(components)/RetakeList";
import RetakePostponeModal from "./(components)/RetakePostponeModal";
import StudentInfoModal from "./(components)/StudentInfoModal";
import { useAllRetakeHistory } from "./(hooks)/useAllRetakeHistory";
import { useRetakeDelete } from "./(hooks)/useRetakeDelete";
import { useRetakes } from "./(hooks)/useRetakes";

export default function RetakesPage() {
  const [filter] = useAtom(filterAtom);
  const [selectedCourse] = useAtom(selectedCourseAtom);
  const [selectedExam] = useAtom(selectedExamAtom);
  const [selectedManagementStatus] = useAtom(selectedManagementStatusAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const [showCompleted] = useAtom(showCompletedAtom);
  const [selectedDate] = useAtom(selectedDateAtom);
  const [minIncompleteCount] = useAtom(minIncompleteCountAtom);
  const [minTotalRetakeCount] = useAtom(minTotalRetakeCountAtom);
  const [minPostponeCount] = useAtom(minPostponeCountAtom);
  const [minAbsentCount] = useAtom(minAbsentCountAtom);
  const [minPostponeAbsentCount] = useAtom(minPostponeAbsentCountAtom);
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
  const { deleteRetake } = useRetakeDelete();
  const { history: allHistory, isLoading: historyLoading } = useAllRetakeHistory();

  type Retake = (typeof fetchedRetakes)[number];

  const handlePostpone = (retake: Retake) => {
    setSelectedRetake(retake);
    setPostponeDate("");
    setPostponeNote("");
    setShowPostponeModal(true);
    setOpenMenuId(null);
  };

  const handleAbsent = (retake: Retake) => {
    setSelectedRetake(retake);
    setShowAbsentModal(true);
    setOpenMenuId(null);
  };

  const handleComplete = (retake: Retake) => {
    setSelectedRetake(retake);
    setShowCompleteModal(true);
    setOpenMenuId(null);
  };

  const handleViewHistory = (retake: Retake) => {
    setSelectedRetake(retake);
    setShowHistoryModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (retake: Retake) => {
    setOpenMenuId(null);
    if (!confirm(`${retake.student.name} 학생의 ${retake.exam.course.name} 재시험을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteRetake(retake.id);
      alert("재시험이 삭제되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "재시험 삭제에 실패했습니다.");
    }
  };

  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentModal(true);
  };

  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const handleManagementStatusChange = (retake: Retake) => {
    setSelectedRetake(retake);
    setShowManagementStatusModal(true);
    setOpenMenuId(null);
  };

  const handleEditDate = (retake: Retake) => {
    setSelectedRetake(retake);
    setEditDate("");
    setShowEditDateModal(true);
    setOpenMenuId(null);
  };

  const handleActionSuccess = () => {
    refetch();
  };

  const incompleteCountByStudent = fetchedRetakes.reduce(
    (acc, retake) => {
      if (retake.status !== "completed") {
        acc[retake.student.id] = (acc[retake.student.id] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalRetakeCountByStudent = fetchedRetakes.reduce(
    (acc, retake) => {
      acc[retake.student.id] = (acc[retake.student.id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const postponeCountByStudent = fetchedRetakes.reduce(
    (acc, retake) => {
      acc[retake.student.id] = (acc[retake.student.id] || 0) + retake.postpone_count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const absentCountByStudent = fetchedRetakes.reduce(
    (acc, retake) => {
      acc[retake.student.id] = (acc[retake.student.id] || 0) + retake.absent_count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const postponeAbsentCountByStudent = fetchedRetakes.reduce(
    (acc, retake) => {
      acc[retake.student.id] = (acc[retake.student.id] || 0) + retake.postpone_count + retake.absent_count;
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
    .filter(
      (retake) =>
        minTotalRetakeCount === 0 || (totalRetakeCountByStudent[retake.student.id] || 0) >= minTotalRetakeCount,
    )
    .filter((retake) => minPostponeCount === 0 || (postponeCountByStudent[retake.student.id] || 0) >= minPostponeCount)
    .filter((retake) => minAbsentCount === 0 || (absentCountByStudent[retake.student.id] || 0) >= minAbsentCount)
    .filter(
      (retake) =>
        minPostponeAbsentCount === 0 ||
        (postponeAbsentCountByStudent[retake.student.id] || 0) >= minPostponeAbsentCount,
    )
    .sort((a, b) => {
      if (
        minIncompleteCount > 0 ||
        minTotalRetakeCount > 0 ||
        minPostponeCount > 0 ||
        minAbsentCount > 0 ||
        minPostponeAbsentCount > 0
      ) {
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
        <RetakeFilters />

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

      <RetakeHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        history={allHistory}
        isLoading={historyLoading}
      />
    </Container>
  );
}
