"use client";

import { useSetAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useUser } from "@/shared/hooks/useUser";
import { showInviteModalAtom, showWorkspaceDeleteModalAtom } from "./(atoms)/useModalStore";
import AdminInviteModal from "./(components)/AdminInviteModal";
import AdminList from "./(components)/AdminList";
import WorkspaceDeleteModal from "./(components)/WorkspaceDeleteModal";
import { useAdmins } from "./(hooks)/useAdmins";

export default function AdminsPage() {
  const { admins, isLoading, error } = useAdmins();
  const setShowInviteModal = useSetAtom(showInviteModalAtom);
  const setShowWorkspaceDeleteModal = useSetAtom(showWorkspaceDeleteModalAtom);
  const { isOwner, isLoading: userLoading } = useUser();

  if (error) {
    return <ErrorComponent errorMessage="관리자 목록을 불러오는데 실패했습니다." />;
  }

  const adminTableSkeleton = (
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <th className="px-spacing-500 py-spacing-400 text-left">
              <Skeleton className="h-6 w-10" />
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left">
              <Skeleton className="h-6 w-16" />
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left">
              <Skeleton className="h-6 w-10" />
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left">
              <Skeleton className="h-6 w-12" />
            </th>
            <th className="w-24 px-spacing-500 py-spacing-400" />
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-line-divider border-t">
              <td className="px-spacing-500 py-spacing-400">
                <Skeleton className="h-6 w-16" />
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <Skeleton className="h-6 w-24" />
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <Skeleton className="h-7 w-12 rounded-radius-200" />
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <Skeleton className="h-6 w-20" />
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <Skeleton className="ml-auto h-9 w-11 rounded-radius-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const isDataLoading = isLoading || userLoading;

  return (
    <Container>
      <Header
        title="관리자 관리"
        subtitle={`워크스페이스 관리자 ${admins.length}명`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={isOwner ? <Button onClick={() => setShowInviteModal(true)}>관리자 추가</Button> : undefined}
      />

      {isDataLoading ? (
        adminTableSkeleton
      ) : admins.length === 0 ? (
        <EmptyState
          message="관리자가 없습니다."
          actionLabel={isOwner ? "관리자 추가" : undefined}
          onAction={isOwner ? () => setShowInviteModal(true) : undefined}
        />
      ) : (
        <AdminList admins={admins} isOwner={isOwner} />
      )}

      {isOwner && (
        <>
          <AdminInviteModal />
          <WorkspaceDeleteModal />
          <div className="mt-spacing-800">
            <div className="overflow-hidden rounded-radius-500 border border-line-outline bg-components-fill-standard-primary">
              <div className="flex items-center justify-between gap-spacing-400 border-l-4 border-l-core-status-negative p-spacing-600">
                <div className="flex flex-col">
                  <h3 className="font-bold text-content-standard-primary text-title">워크스페이스 삭제</h3>
                  <p className="mt-spacing-200 text-body text-content-standard-secondary">
                    워크스페이스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                  </p>
                </div>
                <Button variant="danger" onClick={() => setShowWorkspaceDeleteModal(true)} className="shrink-0">
                  워크스페이스 삭제
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
