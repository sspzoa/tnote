"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { Button, Modal, StatusBadge } from "@/shared/components/ui";
import {
  useManagementStatusCreate,
  useManagementStatusDelete,
  useManagementStatuses,
  useManagementStatusReorder,
  useManagementStatusUpdate,
} from "@/shared/hooks/useManagementStatuses";
import type { ManagementStatusItem, StatusColor } from "@/shared/types";
import { showManagementStatusSettingsModalAtom } from "../(atoms)/useModalStore";

const COLOR_OPTIONS: { value: StatusColor; label: string }[] = [
  { value: "success", label: "초록 (완료)" },
  { value: "warning", label: "노랑 (진행중)" },
  { value: "danger", label: "빨강 (필요)" },
  { value: "info", label: "파랑 (안내)" },
  { value: "neutral", label: "회색 (기본)" },
];

export default function ManagementStatusSettingsModal() {
  const [showModal, setShowModal] = useAtom(showManagementStatusSettingsModalAtom);
  const { statuses, isLoading, refetch } = useManagementStatuses();
  const { mutateAsync: createStatus, isPending: isCreating } = useManagementStatusCreate();
  const { mutateAsync: updateStatus, isPending: isUpdating } = useManagementStatusUpdate();
  const { mutateAsync: deleteStatus, isPending: isDeleting } = useManagementStatusDelete();
  const { mutateAsync: reorderStatuses, isPending: isReordering } = useManagementStatusReorder();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<StatusColor>("neutral");

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<StatusColor>("neutral");

  const [localStatuses, setLocalStatuses] = useState<ManagementStatusItem[]>([]);

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  const isBusy = isCreating || isUpdating || isDeleting || isReordering;

  const handleStartEdit = (status: ManagementStatusItem) => {
    setEditingId(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("neutral");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      await updateStatus({ id: editingId, name: editName.trim(), color: editColor });
      handleCancelEdit();
    } catch (error) {
      alert(error instanceof Error ? error.message : "수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 관리 상태를 삭제하시겠습니까?")) return;

    try {
      await deleteStatus(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      await createStatus({ name: newName.trim(), color: newColor });
      setNewName("");
      setNewColor("neutral");
    } catch (error) {
      alert(error instanceof Error ? error.message : "추가에 실패했습니다.");
    }
  };

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newList = [...localStatuses];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setLocalStatuses(newList);
    },
    [localStatuses],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === localStatuses.length - 1) return;
      const newList = [...localStatuses];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      setLocalStatuses(newList);
    },
    [localStatuses],
  );

  const hasOrderChanged = localStatuses.some((s, i) => s.id !== statuses[i]?.id);

  const handleSaveOrder = async () => {
    try {
      await reorderStatuses(localStatuses.map((s) => s.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "순서 변경에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="관리 상태 설정"
      subtitle="관리 상태 목록을 추가, 수정, 삭제하고 순서를 변경할 수 있습니다"
      footer={
        <>
          {hasOrderChanged && (
            <Button variant="primary" onClick={handleSaveOrder} disabled={isBusy} isLoading={isReordering}>
              순서 저장
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isBusy}>
            닫기
          </Button>
        </>
      }>
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="text-content-standard-tertiary">로딩 중...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-spacing-500">
          <div className="flex flex-col gap-spacing-200">
            <span className="font-semibold text-content-standard-secondary text-label">새 상태 추가</span>
            <div className="flex items-center gap-spacing-300">
              <input
                type="text"
                placeholder="상태 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isBusy}
                className="flex-1 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-body text-content-standard-primary outline-none placeholder:text-content-standard-quaternary focus:border-core-accent"
              />
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value as StatusColor)}
                disabled={isBusy}
                className="w-36 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-body text-content-standard-primary outline-none focus:border-core-accent">
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={isBusy || !newName.trim()}
                isLoading={isCreating}>
                추가
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-spacing-200">
            <span className="font-semibold text-content-standard-secondary text-label">상태 목록</span>
            <div className="max-h-80 overflow-y-auto rounded-radius-300 border border-line-outline">
              {localStatuses.map((status, index) => (
                <div
                  key={status.id}
                  className="flex items-center gap-spacing-300 border-line-divider border-b px-spacing-400 py-spacing-300 last:border-b-0">
                  <div className="flex gap-spacing-100">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isBusy}
                      className="rounded-radius-200 p-spacing-100 text-content-standard-tertiary transition-colors hover:bg-components-fill-standard-secondary disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === localStatuses.length - 1 || isBusy}
                      className="rounded-radius-200 p-spacing-100 text-content-standard-tertiary transition-colors hover:bg-components-fill-standard-secondary disabled:opacity-30">
                      ↓
                    </button>
                  </div>

                  <span className="w-6 text-center text-content-standard-quaternary text-caption">{index + 1}</span>

                  {editingId === status.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={isBusy}
                        className="flex-1 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-body text-content-standard-primary outline-none focus:border-core-accent"
                      />
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value as StatusColor)}
                        disabled={isBusy}
                        className="w-32 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-body text-content-standard-primary outline-none focus:border-core-accent">
                        {COLOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isBusy}
                        isLoading={isUpdating}>
                        저장
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleCancelEdit} disabled={isBusy}>
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <StatusBadge variant={status.color}>{status.name}</StatusBadge>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStartEdit(status)}
                        disabled={isBusy || editingId !== null}>
                        수정
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(status.id)}
                        disabled={isBusy || editingId !== null}
                        isLoading={isDeleting}>
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              ))}

              {localStatuses.length === 0 && (
                <div className="flex h-24 items-center justify-center text-content-standard-tertiary">
                  등록된 관리 상태가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
