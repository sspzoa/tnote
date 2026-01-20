"use client";

import { useSetAtom } from "jotai";
import { AlertTriangle } from "lucide-react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
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

  if (error) {
    return <ErrorComponent errorMessage="관리자 목록을 불러오는데 실패했습니다." />;
  }

  if (userLoading) {
    return <LoadingComponent />;
  }

  return (
    <Container>
      <Header
        title="관리자 관리"
        subtitle={`워크스페이스 관리자 ${admins.length}명`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={isOwner ? <Button onClick={() => setShowInviteModal(true)}>관리자 추가</Button> : undefined}
      />

      {isLoading ? (
        <LoadingComponent />
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
              <div className="flex items-start gap-spacing-400 border-l-4 border-l-core-status-negative p-spacing-600">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-solid-translucent-red">
                  <AlertTriangle className="size-6 text-solid-red" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-content-standard-primary text-title">위험 구역</h3>
                  <p className="mt-spacing-200 text-body text-content-standard-secondary">
                    워크스페이스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setShowWorkspaceDeleteModal(true)}
                    className="mt-spacing-400 w-fit">
                    워크스페이스 삭제
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
