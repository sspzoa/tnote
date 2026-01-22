"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Button, FormCheckbox, FormInput, Modal } from "@/shared/components/ui";
import { TAG_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
import { editTagAssignmentDataAtom, showEditTagAssignmentModalAtom } from "../(atoms)/useModalStore";
import { useRemoveTag, useUpdateTagAssignment } from "../(hooks)/useStudentTags";

export default function EditTagAssignmentModal() {
  const [showModal, setShowModal] = useAtom(showEditTagAssignmentModalAtom);
  const [editData, setEditData] = useAtom(editTagAssignmentDataAtom);
  const { mutateAsync: updateTagAssignment, isPending: isUpdating } = useUpdateTagAssignment();
  const { mutateAsync: removeTag, isPending: isRemoving } = useRemoveTag();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isIndefinite, setIsIndefinite] = useState<boolean>(true);

  useEffect(() => {
    if (editData) {
      setStartDate(editData.assignment.start_date);
      setEndDate(editData.assignment.end_date || "");
      setIsIndefinite(editData.assignment.end_date === null);
    }
  }, [editData]);

  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
  };

  const handleUpdate = async () => {
    if (!editData || !startDate) return;

    try {
      await updateTagAssignment({
        studentId: editData.studentId,
        tagId: editData.assignment.tag_id,
        startDate,
        endDate: isIndefinite ? null : endDate || null,
      });
      alert("태그 날짜가 수정되었습니다.");
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "태그 수정에 실패했습니다.");
    }
  };

  const handleRemove = async () => {
    if (!editData) return;
    if (!confirm(`"${editData.assignment.tag?.name}" 태그를 제거하시겠습니까?`)) return;

    try {
      await removeTag({
        studentId: editData.studentId,
        tagId: editData.assignment.tag_id,
      });
      alert("태그가 제거되었습니다.");
      handleClose();
    } catch {
      alert("태그 제거에 실패했습니다.");
    }
  };

  const tag = editData?.assignment.tag;
  const isProcessing = isUpdating || isRemoving;

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title="태그 수정"
      subtitle={editData ? `${editData.studentName} 학생의 태그 기간을 수정합니다.` : "태그를 수정합니다."}
      footer={
        <>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleRemove}
            disabled={isProcessing}
            isLoading={isRemoving}>
            제거
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleUpdate}
            disabled={!startDate || isProcessing}
            isLoading={isUpdating}
            loadingText="수정 중...">
            수정
          </Button>
        </>
      }>
      <div className="space-y-spacing-400">
        {tag && (
          <div className="flex items-center gap-spacing-200">
            <span className="text-content-standard-tertiary text-footnote">태그:</span>
            <span
              className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${TAG_COLOR_CLASSES[tag.color].bg} ${TAG_COLOR_CLASSES[tag.color].text}`}>
              {tag.name}
            </span>
          </div>
        )}

        <FormInput
          label="시작일"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <div className="space-y-spacing-200">
          <FormCheckbox label="무기한" checked={isIndefinite} onChange={(e) => setIsIndefinite(e.target.checked)} />
          {!isIndefinite && (
            <FormInput label="종료일" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          )}
        </div>
      </div>
    </Modal>
  );
}
