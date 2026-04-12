"use client";

import { History } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import AssignmentTaskAssignModal from "./(components)/AssignmentTaskAssignModal";
import AssignmentTaskCompleteModal from "./(components)/AssignmentTaskCompleteModal";
import AssignmentTaskEditDateModal from "./(components)/AssignmentTaskEditDateModal";
import AssignmentTaskFilters from "./(components)/AssignmentTaskFilters";
import AssignmentTaskHistoryModal from "./(components)/AssignmentTaskHistoryModal";
import AssignmentTaskHistoryPanel from "./(components)/AssignmentTaskHistoryPanel";
import AssignmentTaskList from "./(components)/AssignmentTaskList";
import AssignmentTaskPostponeModal from "./(components)/AssignmentTaskPostponeModal";
import StudentInfoModal from "./(components)/StudentInfoModal";
import { useAllAssignmentTaskHistory } from "./(hooks)/useAllAssignmentTaskHistory";
import { useAssignmentTaskFilters } from "./(hooks)/useAssignmentTaskFilters";
import { useAssignmentTaskHandlers } from "./(hooks)/useAssignmentTaskHandlers";

export default function AssignmentsPage() {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const { fetchedTasks, filteredTasks, isLoading, error, refetch } = useAssignmentTaskFilters();
  const { history: allHistory, isLoading: historyLoading } = useAllAssignmentTaskHistory();

  const {
    handlePostpone,
    handleComplete,
    handleMarkInsufficient,
    handleMarkNotSubmitted,
    handleMarkAbsent,
    handleViewHistory,
    handleDelete,
    handleViewStudent,
    handleAssignClick,
    handleEditDate,
    handleActionSuccess,
  } = useAssignmentTaskHandlers(refetch);

  if (error) {
    return (
      <Container>
        <Header
          title="과제 관리"
          subtitle="학생별 과제 상태를 관리합니다"
          backLink={{ href: "/", label: "홈으로 돌아가기" }}
        />
        <ErrorComponent errorMessage={error.message} />
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title="과제 관리"
        subtitle="학생별 과제 상태를 관리합니다"
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
            <Button onClick={handleAssignClick}>+ 개별 과제 배정</Button>
          </div>
        }
      />

      <AssignmentTaskFilters />

      {isLoading ? (
        <SkeletonTable
          rows={8}
          columns={[
            { width: "w-28", badges: ["w-16", "w-10"] },
            { width: "w-24", stacked: ["w-24", "w-28"] },
            { width: "w-24", stacked: ["w-20", "w-16"] },
            { width: "w-14", rounded: true },
            { width: "w-20", rounded: true },
            "action",
          ]}
        />
      ) : fetchedTasks.length === 0 ? (
        <EmptyState message="과제가 없습니다." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState message="검색 결과가 없습니다." />
      ) : (
        <AssignmentTaskList
          tasks={filteredTasks}
          onViewStudent={handleViewStudent}
          onPostpone={handlePostpone}
          onComplete={handleComplete}
          onMarkInsufficient={handleMarkInsufficient}
          onMarkNotSubmitted={handleMarkNotSubmitted}
          onMarkAbsent={handleMarkAbsent}
          onViewHistory={handleViewHistory}
          onDelete={handleDelete}
          onEditDate={handleEditDate}
        />
      )}

      <AssignmentTaskPostponeModal onSuccess={handleActionSuccess} />
      <AssignmentTaskCompleteModal onSuccess={handleActionSuccess} />
      <AssignmentTaskHistoryModal onSuccess={handleActionSuccess} />
      <StudentInfoModal />
      <AssignmentTaskAssignModal onSuccess={handleActionSuccess} />
      <AssignmentTaskEditDateModal onSuccess={handleActionSuccess} />

      <AssignmentTaskHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        history={allHistory}
        isLoading={historyLoading}
      />
    </Container>
  );
}
