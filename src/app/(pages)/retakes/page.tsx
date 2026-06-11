"use client";

import { useAtom, useSetAtom } from "jotai";
import { History, Settings } from "lucide-react";
import { useState } from "react";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Button } from "@/shared/components/ui/button";
import { CollectionView } from "@/shared/components/ui/collectionView";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { type ViewTabItem, ViewTabs } from "@/shared/components/ui/viewTabs";
import { showManagementStatusSettingsModalAtom } from "./(atoms)/useModalStore";
import { searchQueryAtom } from "./(atoms)/useRetakesStore";
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

type RetakeView = "all" | "pending" | "completed" | "absent";

export default function RetakesPage() {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [activeView, setActiveView] = useState<RetakeView>("all");
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
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

  const viewRetakes = activeView === "all" ? filteredRetakes : filteredRetakes.filter((r) => r.status === activeView);

  const viewItems: ViewTabItem<RetakeView>[] = [
    { value: "all", label: "전체", count: fetchedRetakes.length },
    {
      value: "pending",
      label: "대기",
      count: fetchedRetakes.filter((r) => r.status === "pending").length,
      tone: "warning",
    },
    {
      value: "completed",
      label: "완료",
      count: fetchedRetakes.filter((r) => r.status === "completed").length,
      tone: "success",
    },
    {
      value: "absent",
      label: "결석",
      count: fetchedRetakes.filter((r) => r.status === "absent").length,
      tone: "danger",
    },
  ];

  const actions = (
    <>
      <Button variant="secondary" size="sm" onClick={() => setShowHistoryPanel(true)}>
        <History className="size-4" />
        <span className="hidden sm:inline">최근 이력</span>
        {allHistory.length > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-primary-foreground text-xs tabular-nums">
            {allHistory.length}
          </span>
        )}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setShowSettingsModal(true)}>
        <Settings className="size-4" />
        <span className="hidden md:inline">관리 상태 설정</span>
      </Button>
      <Button size="sm" onClick={handleAssignClick}>
        + 재시험 할당
      </Button>
    </>
  );

  if (error) {
    return (
      <PageShell title="재시험 관리" subtitle="학생들의 재시험을 관리합니다" actions={actions}>
        <ErrorComponent errorMessage={error.message} />
      </PageShell>
    );
  }

  const emptyNode =
    fetchedRetakes.length === 0 ? (
      <EmptyState tone="retakes" message="재시험이 없습니다." subtitle="시험을 등록하고 재시험을 할당해 보세요." />
    ) : (
      <EmptyState tone="retakes" message="조건에 맞는 재시험이 없어요" subtitle="검색어나 필터를 조정해 보세요." />
    );

  return (
    <PageShell title="재시험 관리" subtitle="학생들의 재시험을 관리합니다" actions={actions}>
      <ViewTabs items={viewItems} value={activeView} onChange={setActiveView} />

      <CollectionView
        search={
          <SearchInput
            placeholder="학생 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        }
        filters={<RetakeFilters />}>
        <RetakeList
          retakes={viewRetakes}
          isLoading={isLoading}
          empty={emptyNode}
          onViewStudent={handleViewStudent}
          onPostpone={handlePostpone}
          onAbsent={handleAbsent}
          onComplete={handleComplete}
          onViewHistory={handleViewHistory}
          onDelete={handleDelete}
          onManagementStatusChange={handleManagementStatusChange}
          onEditDate={handleEditDate}
        />
      </CollectionView>

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
    </PageShell>
  );
}
