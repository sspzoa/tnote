"use client";

import { useSetAtom } from "jotai";
import Link from "next/link";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { showInviteModalAtom } from "./(atoms)/useModalStore";
import AdminInviteModal from "./(components)/AdminInviteModal";
import AdminList from "./(components)/AdminList";
import { useAdmins } from "./(hooks)/useAdmins";

export default function AdminsPage() {
  const { admins, isLoading, error } = useAdmins();
  const setShowInviteModal = useSetAtom(showInviteModalAtom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage="관리자 목록을 불러오는데 실패했습니다." />;
  }

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header
        title="관리자 관리"
        subtitle={`워크스페이스 관리자 ${admins.length}명`}
        action={
          <button
            onClick={() => setShowInviteModal(true)}
            className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            관리자 추가
          </button>
        }
      />

      {admins.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">관리자가 없습니다.</p>
        </div>
      ) : (
        <AdminList admins={admins} />
      )}

      <AdminInviteModal />
    </Container>
  );
}
