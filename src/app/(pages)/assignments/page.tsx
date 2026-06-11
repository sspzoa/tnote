"use client";

import { useAtom } from "jotai";
import { History } from "lucide-react";
import { useState } from "react";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Button } from "@/shared/components/ui/button";
import { CollectionView } from "@/shared/components/ui/collectionView";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { type ViewTabItem, ViewTabs } from "@/shared/components/ui/viewTabs";
import { searchQueryAtom } from "./(atoms)/useAssignmentTaskStore";
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

type AssignmentTaskView = "all" | "pending" | "completed" | "problem";

export default function AssignmentsPage() {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [activeView, setActiveView] = useState<AssignmentTaskView>("all");
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

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

  const isProblem = (status: string) => status === "insufficient" || status === "not_submitted" || status === "absent";

  const viewTasks =
    activeView === "all"
      ? filteredTasks
      : activeView === "problem"
        ? filteredTasks.filter((t) => isProblem(t.status))
        : filteredTasks.filter((t) => t.status === activeView);

  const viewItems: ViewTabItem<AssignmentTaskView>[] = [
    { value: "all", label: "전체", count: fetchedTasks.length },
    {
      value: "pending",
      label: "검사예정",
      count: fetchedTasks.filter((t) => t.status === "pending").length,
      tone: "warning",
    },
    {
      value: "completed",
      label: "완료",
      count: fetchedTasks.filter((t) => t.status === "completed").length,
      tone: "success",
    },
    {
      value: "problem",
      label: "문제",
      count: fetchedTasks.filter((t) => isProblem(t.status)).length,
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
      <Button size="sm" onClick={handleAssignClick}>
        + 개별 과제 배정
      </Button>
    </>
  );

  if (error) {
    return (
      <PageShell title="과제 관리" subtitle="학생별 과제 상태를 관리합니다" actions={actions}>
        <ErrorComponent errorMessage={error.message} />
      </PageShell>
    );
  }

  const emptyNode =
    fetchedTasks.length === 0 ? (
      <EmptyState tone="assignments" message="과제가 없습니다." subtitle="과제를 등록하고 학생에게 배정해 보세요." />
    ) : (
      <EmptyState tone="assignments" message="조건에 맞는 과제가 없어요" subtitle="검색어나 필터를 조정해 보세요." />
    );

  return (
    <PageShell title="과제 관리" subtitle="학생별 과제 상태를 관리합니다" actions={actions}>
      <ViewTabs items={viewItems} value={activeView} onChange={setActiveView} />

      <CollectionView
        search={
          <SearchInput
            placeholder="학생 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        }
        filters={<AssignmentTaskFilters />}>
        <AssignmentTaskList
          tasks={viewTasks}
          isLoading={isLoading}
          empty={emptyNode}
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
      </CollectionView>

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
    </PageShell>
  );
}
