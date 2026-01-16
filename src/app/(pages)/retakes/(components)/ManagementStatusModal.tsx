"use client";

import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Button, FormSelect, Modal } from "@/shared/components/ui";
import { showManagementStatusModalAtom } from "../(atoms)/useModalStore";
import { type ManagementStatus, selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeManagementStatus } from "../(hooks)/useRetakeManagementStatus";

const MANAGEMENT_STATUS_OPTIONS: { value: ManagementStatus; label: ManagementStatus }[] = [
  { value: "재시 안내 예정", label: "재시 안내 예정" },
  { value: "재시 안내 완료", label: "재시 안내 완료" },
  { value: "클리닉 1회 불참 연락 필요", label: "클리닉 1회 불참 연락 필요" },
  { value: "클리닉 1회 불참 연락 완료", label: "클리닉 1회 불참 연락 완료" },
  { value: "클리닉 2회 불참 연락 필요", label: "클리닉 2회 불참 연락 필요" },
  { value: "클리닉 2회 불참 연락 완료", label: "클리닉 2회 불참 연락 완료" },
  { value: "실장 집중 상담 필요", label: "실장 집중 상담 필요" },
  { value: "실장 집중 상담 진행 중", label: "실장 집중 상담 진행 중" },
  { value: "실장 집중 상담 완료", label: "실장 집중 상담 완료" },
];

interface ManagementStatusModalProps {
  onSuccess: () => void;
}

export default function ManagementStatusModal({ onSuccess }: ManagementStatusModalProps) {
  const [showModal, setShowModal] = useAtom(showManagementStatusModalAtom);
  const selectedRetake = useAtomValue(selectedRetakeAtom);
  const { updateManagementStatus, isUpdating } = useRetakeManagementStatus();
  const [selectedStatus, setSelectedStatus] = useState<ManagementStatus>(
    selectedRetake?.management_status || "재시 안내 예정",
  );

  if (!selectedRetake) return null;

  const handleUpdate = async () => {
    try {
      await updateManagementStatus({ retakeId: selectedRetake.id, status: selectedStatus });
      alert("관리 상태가 변경되었습니다.");
      setShowModal(false);
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : "관리 상태 변경에 실패했습니다.");
    }
  };

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
            disabled={isUpdating}
            isLoading={isUpdating}>
            변경
          </Button>
        </>
      }>
      <FormSelect
        label="관리 상태"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value as ManagementStatus)}
        options={MANAGEMENT_STATUS_OPTIONS}
        required
      />
    </Modal>
  );
}
