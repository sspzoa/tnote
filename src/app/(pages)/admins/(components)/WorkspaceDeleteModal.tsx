"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { useUser } from "@/shared/hooks/useUser";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { showWorkspaceDeleteModalAtom } from "../(atoms)/useModalStore";
import { useWorkspaceDelete } from "../(hooks)/useWorkspaceDelete";

const CONFIRM_TEXT = "워크스페이스 삭제";

export default function WorkspaceDeleteModal() {
  const [isOpen, setIsOpen] = useAtom(showWorkspaceDeleteModalAtom);
  const [confirmInput, setConfirmInput] = useState("");
  const { user } = useUser();
  const { deleteWorkspace, isDeleting } = useWorkspaceDelete();
  const toast = useToast();

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
      toast.error(getErrorMessage(error, "워크스페이스 삭제에 실패했습니다."));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleDelete}
      title="워크스페이스 삭제"
      subtitle="이 작업은 되돌릴 수 없습니다"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            isLoading={isDeleting}
            loadingText="삭제 중..."
            className="flex-1">
            워크스페이스 삭제
          </Button>
        </>
      }>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-solid-translucent-red p-4">
          <p className="font-semibold text-base text-destructive">경고: 이 작업은 되돌릴 수 없습니다!</p>
          <ul className="flex list-inside list-disc flex-col gap-1 text-muted-foreground text-sm">
            <li>모든 학생 데이터가 삭제됩니다</li>
            <li>모든 수업 및 시험 데이터가 삭제됩니다</li>
            <li>모든 재시험 기록이 삭제됩니다</li>
            <li>모든 클리닉 데이터가 삭제됩니다</li>
            <li>모든 관리자 계정이 삭제됩니다</li>
            <li>모든 문자 발송 기록이 삭제됩니다</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-base text-foreground">
            삭제를 확인하려면 <span className="font-bold text-destructive">{CONFIRM_TEXT}</span>를 입력하세요.
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
