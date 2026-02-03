"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useUser } from "@/shared/hooks/useUser";
import { showWorkspaceDeleteModalAtom } from "../(atoms)/useModalStore";
import { useWorkspaceDelete } from "../(hooks)/useWorkspaceDelete";

const CONFIRM_TEXT = "워크스페이스 삭제";

export default function WorkspaceDeleteModal() {
  const [isOpen, setIsOpen] = useAtom(showWorkspaceDeleteModalAtom);
  const [confirmInput, setConfirmInput] = useState("");
  const { user } = useUser();
  const { deleteWorkspace, isDeleting } = useWorkspaceDelete();

  const isConfirmed = confirmInput === CONFIRM_TEXT;

  const handleClose = () => {
    setIsOpen(false);
    setConfirmInput("");
  };

  const handleDelete = async () => {
    if (!user?.workspace || !isConfirmed) return;

    try {
      await deleteWorkspace(user.workspace);
    } catch (error) {
      alert(error instanceof Error ? error.message : "워크스페이스 삭제에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="워크스페이스 삭제"
      subtitle="이 작업은 되돌릴 수 없습니다"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            isLoading={isDeleting}
            loadingText="삭제 중..."
            className="flex-1">
            워크스페이스 삭제
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <div className="flex flex-col gap-spacing-200 rounded-radius-300 border border-core-status-negative/30 bg-solid-translucent-red p-spacing-400">
          <p className="font-semibold text-body text-core-status-negative">경고: 이 작업은 되돌릴 수 없습니다!</p>
          <ul className="flex list-inside list-disc flex-col gap-spacing-100 text-content-standard-secondary text-label">
            <li>모든 학생 데이터가 삭제됩니다</li>
            <li>모든 수업 및 시험 데이터가 삭제됩니다</li>
            <li>모든 재시험 기록이 삭제됩니다</li>
            <li>모든 클리닉 데이터가 삭제됩니다</li>
            <li>모든 관리자 계정이 삭제됩니다</li>
            <li>모든 문자 발송 기록이 삭제됩니다</li>
          </ul>
        </div>

        <div className="flex flex-col gap-spacing-200">
          <p className="text-body text-content-standard-primary">
            삭제를 확인하려면 <span className="font-bold text-core-status-negative">{CONFIRM_TEXT}</span>를 입력하세요.
          </p>
          <FormInput
            label="확인 입력"
            placeholder={CONFIRM_TEXT}
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
    </Modal>
  );
}
