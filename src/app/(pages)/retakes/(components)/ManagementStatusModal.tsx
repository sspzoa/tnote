"use client";

import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Button, Modal, StatusBadge } from "@/shared/components/ui";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import type { StatusColor } from "@/shared/types";
import { showManagementStatusModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeManagementStatus } from "../(hooks)/useRetakeManagementStatus";

interface ManagementStatusModalProps {
  onSuccess: () => void;
}

export default function ManagementStatusModal({ onSuccess }: ManagementStatusModalProps) {
  const [showModal, setShowModal] = useAtom(showManagementStatusModalAtom);
  const selectedRetake = useAtomValue(selectedRetakeAtom);
  const { updateManagementStatus, isUpdating } = useRetakeManagementStatus();
  const { statuses, isLoading: isLoadingStatuses } = useManagementStatuses();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    if (selectedRetake?.management_status) {
      setSelectedStatus(selectedRetake.management_status);
    }
  }, [selectedRetake?.management_status]);

  const currentIndex = useMemo(() => statuses.findIndex((s) => s.name === selectedStatus), [statuses, selectedStatus]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < statuses.length - 1 && currentIndex !== -1;

  const handlePrev = () => {
    if (hasPrev) {
      setSelectedStatus(statuses[currentIndex - 1].name);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedStatus(statuses[currentIndex + 1].name);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRetake || !selectedStatus) return;

    try {
      await updateManagementStatus({ retakeId: selectedRetake.id, status: selectedStatus });
      alert("관리 상태가 변경되었습니다.");
      setShowModal(false);
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : "관리 상태 변경에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const currentStatusItem = statuses.find((s) => s.name === selectedStatus);

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="관리 상태 변경"
      subtitle={`${selectedRetake.student.name} 학생의 재시험 관리 상태를 변경합니다`}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)} disabled={isUpdating}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleUpdate}
            disabled={isUpdating || !selectedStatus || selectedStatus === selectedRetake.management_status}
            isLoading={isUpdating}>
            변경
          </Button>
        </>
      }>
      {isLoadingStatuses ? (
        <div className="flex h-32 items-center justify-center">
          <span className="text-content-standard-tertiary">로딩 중...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-spacing-400">
          <div className="flex items-center justify-between gap-spacing-300">
            <Button variant="secondary" onClick={handlePrev} disabled={!hasPrev || isUpdating} className="flex-1">
              ← 이전
            </Button>
            <Button variant="secondary" onClick={handleNext} disabled={!hasNext || isUpdating} className="flex-1">
              다음 →
            </Button>
          </div>

          <div className="flex flex-col items-center gap-spacing-200 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-400">
            <span className="text-content-standard-tertiary text-caption">현재 선택</span>
            {currentStatusItem ? (
              <StatusBadge variant={currentStatusItem.color as StatusColor}>{currentStatusItem.name}</StatusBadge>
            ) : (
              <span className="text-content-standard-secondary">상태를 선택해주세요</span>
            )}
            <span className="text-content-standard-quaternary text-caption">
              {currentIndex + 1} / {statuses.length}
            </span>
          </div>

          <div className="-m-spacing-100 max-h-48 overflow-y-auto p-spacing-100">
            <div className="flex flex-col gap-spacing-100">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setSelectedStatus(status.name)}
                  disabled={isUpdating}
                  className={`flex items-center justify-between rounded-radius-200 px-spacing-300 py-spacing-200 text-left transition-colors ${
                    selectedStatus === status.name
                      ? "bg-core-accent-translucent ring-1 ring-core-accent"
                      : "hover:bg-components-fill-standard-secondary"
                  }`}>
                  <StatusBadge variant={status.color as StatusColor}>{status.name}</StatusBadge>
                  <span className="text-content-standard-quaternary text-caption">{status.display_order}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
