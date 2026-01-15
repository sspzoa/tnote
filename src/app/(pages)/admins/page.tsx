"use client";

import { useSetAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { useUser } from "@/shared/hooks/useUser";
import { showInviteModalAtom } from "./(atoms)/useModalStore";
import AdminInviteModal from "./(components)/AdminInviteModal";
import AdminList from "./(components)/AdminList";
import { useAdmins } from "./(hooks)/useAdmins";

export default function AdminsPage() {
  const { admins, isLoading, error } = useAdmins();
  const setShowInviteModal = useSetAtom(showInviteModalAtom);
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

      {isOwner && <AdminInviteModal />}
    </Container>
  );
}
