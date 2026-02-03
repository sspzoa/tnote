"use client";

import { useSetAtom } from "jotai";
import { History, Settings } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { showManagementStatusSettingsModalAtom } from "./(atoms)/useModalStore";
import ManagementStatusModal from "./(components)/ManagementStatusModal";
import ManagementStatusSettingsModal from "./(components)/ManagementStatusSettingsModal";
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
import { useRetakeFilters } from "./(hooks)/useRetakeFilters";
import { useRetakeHandlers } from "./(hooks)/useRetakeHandlers";

export default function RetakesPage() {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const setShowSettingsModal = useSetAtom(showManagementStatusSettingsModalAtom);

  const { fetchedRetakes, filteredRetakes, isLoading, error, refetch } = useRetakeFilters();
  const { history: allHistory, isLoading: historyLoading } = useAllRetakeHistory();

  const {
    handlePostpone,
    handleAbsent,
    handleComplete,
    handleViewHistory,
    handleDelete,
    handleViewStudent,
    handleAssignClick,
    handleManagementStatusChange,
    handleEditDate,
    handleActionSuccess,
  } = useRetakeHandlers(refetch);

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
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-spacing-200">
              <Settings className="size-4" />
              관리 상태 설정
            </Button>
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

      <RetakeFilters />

      {isLoading ? (
        <SkeletonTable
          rows={8}
          columns={[
            { width: "w-16", stacked: ["w-16", "w-24"] },
            { width: "w-20", stacked: ["w-20", "w-24"] },
            { width: "w-20", stacked: ["w-20", "w-16"] },
            { width: "w-12", rounded: true },
            { width: "w-24", rounded: true },
            "action",
          ]}
        />
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

      <RetakePostponeModal onSuccess={handleActionSuccess} />
      <RetakeAbsentModal onSuccess={handleActionSuccess} />
      <RetakeCompleteModal onSuccess={handleActionSuccess} />
      <RetakeHistoryModal onSuccess={handleActionSuccess} />
      <StudentInfoModal />
      <RetakeAssignModal onSuccess={handleActionSuccess} />
      <ManagementStatusModal onSuccess={handleActionSuccess} />
      <ManagementStatusSettingsModal />
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
