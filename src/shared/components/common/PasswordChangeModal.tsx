"use client";

import { useState } from "react";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
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
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
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
        alert("비밀번호가 변경되었습니다.");
        handleClose();
      } else {
        alert(result.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch {
      alert("비밀번호 변경에 실패했습니다.");
    } finally {
      setPasswordChanging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-radius-500 bg-components-fill-standard-primary p-spacing-700">
        <h2 className="mb-spacing-600 font-bold text-content-standard-primary text-heading">비밀번호 변경</h2>

        <div className="space-y-spacing-500">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
              현재 비밀번호
            </label>
            <input
              type="password"
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-spacing-200 block font-medium text-content-standard-primary text-label">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
            />
          </div>

          <p className="text-content-standard-tertiary text-label">비밀번호는 8자 이상이어야 합니다.</p>
        </div>

        <div className="mt-spacing-600 flex justify-end gap-spacing-300">
          <button
            onClick={handleClose}
            className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          <button
            onClick={handlePasswordChange}
            disabled={
              passwordChanging ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
            className="rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-medium text-body text-white transition-colors hover:bg-core-accent-active disabled:opacity-50">
            {passwordChanging ? "변경 중..." : "변경"}
          </button>
        </div>
      </div>
    </div>
  );
}
