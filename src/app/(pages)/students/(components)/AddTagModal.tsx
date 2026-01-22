"use client";

import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Button, FormCheckbox, FormInput, FormSelect, Modal } from "@/shared/components/ui";
import { getTodayKST } from "@/shared/lib/utils/date";
import type { TagColor } from "@/shared/types";
import { showAddTagModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useAssignTag } from "../(hooks)/useStudentTags";
import { useTags } from "../(hooks)/useTags";

const TAG_COLOR_CLASSES: Record<TagColor, { bg: string; text: string }> = {
  red: { bg: "bg-solid-translucent-red", text: "text-solid-red" },
  orange: { bg: "bg-solid-translucent-orange", text: "text-solid-orange" },
  yellow: { bg: "bg-solid-translucent-yellow", text: "text-solid-yellow" },
  green: { bg: "bg-solid-translucent-green", text: "text-solid-green" },
  blue: { bg: "bg-solid-translucent-blue", text: "text-solid-blue" },
  indigo: { bg: "bg-solid-translucent-indigo", text: "text-solid-indigo" },
  purple: { bg: "bg-solid-translucent-purple", text: "text-solid-purple" },
  pink: { bg: "bg-solid-translucent-pink", text: "text-solid-pink" },
  brown: { bg: "bg-solid-translucent-brown", text: "text-solid-brown" },
  black: { bg: "bg-solid-translucent-black", text: "text-solid-black" },
  white: { bg: "bg-components-fill-standard-secondary", text: "text-content-standard-primary" },
};

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
      <div className="space-y-spacing-400">
        <div>
          <FormSelect
            label="태그"
            required
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            options={tagOptions}
            disabled={isTagsLoading}
          />
          {selectedTag && (
            <div className="mt-spacing-200 flex items-center gap-spacing-200">
              <span className="text-content-standard-tertiary text-footnote">선택된 태그:</span>
              <span
                className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${TAG_COLOR_CLASSES[selectedTag.color].bg} ${TAG_COLOR_CLASSES[selectedTag.color].text}`}>
                {selectedTag.name}
              </span>
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
