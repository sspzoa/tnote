"use client";

import { History } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
import { useRetakeFilters } from "./(hooks)/useRetakeFilters";
import { useRetakeHandlers } from "./(hooks)/useRetakeHandlers";

export default function RetakesPage() {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

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
          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left">
                    <Skeleton className="h-6 w-10" />
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left">
                    <Skeleton className="h-6 w-10" />
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left">
                    <Skeleton className="h-6 w-12" />
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left">
                    <Skeleton className="h-6 w-10" />
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left">
                    <Skeleton className="h-6 w-16" />
                  </th>
                  <th className="w-24 px-spacing-500 py-spacing-400" />
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="border-line-divider border-t">
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="space-y-spacing-100">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="space-y-spacing-100">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="space-y-spacing-100">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <Skeleton className="h-7 w-12 rounded-radius-200" />
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <Skeleton className="h-7 w-24 rounded-radius-200" />
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <Skeleton className="ml-auto h-9 w-11 rounded-radius-200" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
