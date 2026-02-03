"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const toast = useToast();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordChanging, setPasswordChanging] = useState(false);

  const handleClose = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    onClose();
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setPasswordChanging(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("비밀번호가 변경되었습니다.");
        handleClose();
      } else {
        toast.error(result.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch {
      toast.error("비밀번호 변경에 실패했습니다.");
    } finally {
      setPasswordChanging(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="비밀번호 변경"
      subtitle="비밀번호는 8자 이상이어야 합니다."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={
              passwordChanging ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
            isLoading={passwordChanging}
            loadingText="변경 중..."
            className="flex-1">
            변경
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-400">
        <FormInput
          label="현재 비밀번호"
          required
          type="password"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
        />

        <FormInput
          label="새 비밀번호"
          required
          type="password"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
        />

        <FormInput
          label="새 비밀번호 확인"
          required
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
        />
      </div>
    </Modal>
  );
}
