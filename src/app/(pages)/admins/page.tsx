"use client";

import { useSetAtom } from "jotai";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Button } from "@/shared/components/ui/button";
import { CollectionView } from "@/shared/components/ui/collectionView";
import { EmptyState } from "@/shared/components/ui/emptyState";
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

  const actions = isOwner ? (
    <Button size="sm" onClick={() => setShowInviteModal(true)}>
      관리자 추가
    </Button>
  ) : undefined;

  if (error) {
    return (
      <PageShell title="관리자 관리" subtitle={`워크스페이스 관리자 ${admins.length}명`} actions={actions}>
        <ErrorComponent errorMessage="관리자 목록을 불러오는데 실패했습니다." />
      </PageShell>
    );
  }

  const isDataLoading = isLoading || userLoading;

  const emptyNode = (
    <EmptyState
      tone="admins"
      message="관리자가 없습니다."
      actionLabel={isOwner ? "관리자 추가" : undefined}
      onAction={isOwner ? () => setShowInviteModal(true) : undefined}
    />
  );

  return (
    <PageShell title="관리자 관리" subtitle={`워크스페이스 관리자 ${admins.length}명`} actions={actions}>
      <CollectionView>
        <AdminList admins={admins} isOwner={isOwner} isLoading={isDataLoading} empty={emptyNode} />
      </CollectionView>

      {isOwner && (
        <>
          <AdminInviteModal />
          <WorkspaceDeleteModal />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-4 border-l-4 border-l-destructive p-7">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-foreground text-lg">워크스페이스 삭제</h3>
                <p className="text-muted-foreground text-sm">
                  워크스페이스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setShowWorkspaceDeleteModal(true)} className="shrink-0">
                워크스페이스 삭제
              </Button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
