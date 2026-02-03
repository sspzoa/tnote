"use client";

import { useAtom, useAtomValue } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, IconButton, Modal, StatusBadge } from "@/shared/components/ui";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import { useToast } from "@/shared/hooks/useToast";
import type { StatusColor } from "@/shared/types";
import { showManagementStatusModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeManagementStatus } from "../(hooks)/useRetakeManagementStatus";

interface ManagementStatusModalProps {
  onSuccess: () => void;
}

const ITEM_WIDTH = 100;
const GAP = 100;

export default function ManagementStatusModal({ onSuccess }: ManagementStatusModalProps) {
  const [showModal, setShowModal] = useAtom(showManagementStatusModalAtom);
  const selectedRetake = useAtomValue(selectedRetakeAtom);
  const { updateManagementStatus, isUpdating } = useRetakeManagementStatus();
  const { statuses, isLoading: isLoadingStatuses } = useManagementStatuses();
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const toast = useToast();

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
      toast.success("관리 상태가 변경되었습니다.");
      setShowModal(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "관리 상태 변경에 실패했습니다.");
    }
  };

  if (!selectedRetake) return null;

  const offset = currentIndex * (ITEM_WIDTH + GAP);

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
        <div className="flex flex-col items-center gap-spacing-500">
          <div className="flex w-full items-center justify-center gap-spacing-300">
            <IconButton
              variant="outline"
              size="lg"
              onClick={handlePrev}
              disabled={!hasPrev || isUpdating}
              aria-label="이전 상태">
              <ChevronLeft className="size-6" />
            </IconButton>

            <div className="relative h-16 flex-1 overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary">
              <div
                className="absolute top-1/2 left-1/2 flex items-center transition-transform duration-300 ease-out"
                style={{
                  gap: GAP,
                  transform: `translate(${-ITEM_WIDTH / 2 - offset}px, -50%)`,
                }}>
                {statuses.map((status, index) => (
                  <div
                    key={status.id}
                    className="flex shrink-0 items-center justify-center whitespace-nowrap transition-all duration-300"
                    style={{
                      width: ITEM_WIDTH,
                      opacity: index === currentIndex ? 1 : 0.4,
                      transform: index === currentIndex ? "scale(1.1)" : "scale(1)",
                    }}>
                    <StatusBadge variant={status.color as StatusColor}>{status.name}</StatusBadge>
                  </div>
                ))}
              </div>
            </div>

            <IconButton
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={!hasNext || isUpdating}
              aria-label="다음 상태">
              <ChevronRight className="size-6" />
            </IconButton>
          </div>

          <div className="flex items-center gap-spacing-200">
            {statuses.map((status, index) => (
              <button
                key={status.id}
                type="button"
                onClick={() => {
                  if (!isUpdating) {
                    setSelectedStatus(status.name);
                  }
                }}
                disabled={isUpdating}
                className={`size-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "scale-125 bg-core-accent"
                    : "bg-line-outline hover:bg-content-standard-quaternary"
                }`}
                aria-label={status.name}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
