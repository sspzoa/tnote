"use client";

import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Badge, Button, FormCheckbox, FormInput, FormSelect, Modal } from "@/shared/components/ui";
import { getTodayKST } from "@/shared/lib/utils/date";
import { showAddTagModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useAssignTag } from "../(hooks)/useStudentTags";
import { useTags } from "../(hooks)/useTags";

export default function AddTagModal() {
  const [showModal, setShowModal] = useAtom(showAddTagModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const { tags, isLoading: isTagsLoading } = useTags();
  const { mutateAsync: assignTag, isPending: isAssigning } = useAssignTag();

  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getTodayKST());
  const [endDate, setEndDate] = useState<string>("");
  const [isIndefinite, setIsIndefinite] = useState<boolean>(true);

  const resetForm = () => {
    setSelectedTagId("");
    setStartDate(getTodayKST());
    setEndDate("");
    setIsIndefinite(true);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAssign = async () => {
    if (!selectedStudent || !selectedTagId || !startDate) return;

    try {
      await assignTag({
        studentId: selectedStudent.id,
        tagId: selectedTagId,
        startDate,
        endDate: isIndefinite ? null : endDate || null,
      });
      alert("태그가 추가되었습니다.");
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "태그 추가에 실패했습니다.");
    }
  };

  const selectedTag = tags.find((tag) => tag.id === selectedTagId);
  const tagOptions = [
    { value: "", label: "태그를 선택하세요" },
    ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
  ];

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title="태그 추가"
      subtitle={selectedStudent ? `${selectedStudent.name} 학생에게 태그를 추가합니다.` : "태그를 추가합니다."}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleAssign}
            disabled={!selectedTagId || !startDate}
            isLoading={isAssigning}
            loadingText="추가 중...">
            추가
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-400">
        <div className="flex flex-col gap-spacing-200">
          <FormSelect
            label="태그"
            required
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            options={tagOptions}
            disabled={isTagsLoading}
          />
          {selectedTag && (
            <div className="flex items-center gap-spacing-200">
              <span className="text-content-standard-tertiary text-footnote">선택된 태그:</span>
              <Badge variant={selectedTag.color} size="xs">
                {selectedTag.name}
              </Badge>
            </div>
          )}
        </div>

        <FormInput
          label="시작일"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <div className="flex flex-col gap-spacing-200">
          <FormCheckbox label="무기한" checked={isIndefinite} onChange={(e) => setIsIndefinite(e.target.checked)} />
          {!isIndefinite && (
            <FormInput label="종료일" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          )}
        </div>
      </div>
    </Modal>
  );
}
