"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { Button, FormInput, Modal } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks/useToast";
import { TAG_COLOR_STYLES, TAG_COLORS, TAG_SOLID_COLORS } from "@/shared/lib/utils/tagColors";
import type { StudentTag, TagColor } from "@/shared/types";
import { showTagManageModalAtom } from "../(atoms)/useModalStore";
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from "../(hooks)/useTags";
import { TagListSkeleton } from "./TagListSkeleton";

interface TagFormState {
  name: string;
  color: TagColor;
  hiddenByDefault: boolean;
}

const initialFormState: TagFormState = {
  name: "",
  color: "blue",
  hiddenByDefault: false,
};

export default function TagManageModal() {
  const [showModal, setShowModal] = useAtom(showTagManageModalAtom);
  const { tags, isLoading } = useTags();
  const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();
  const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag();
  const { mutateAsync: deleteTag, isPending: isDeleting } = useDeleteTag();
  const toast = useToast();

  const [form, setForm] = useState<TagFormState>(initialFormState);
  const [editingTag, setEditingTag] = useState<StudentTag | null>(null);

  const isProcessing = isCreating || isUpdating || isDeleting;

  const handleCreate = async () => {
    if (!form.name.trim()) return;

    try {
      await createTag({ name: form.name.trim(), color: form.color, hiddenByDefault: form.hiddenByDefault });
      toast.success("태그가 추가되었습니다.");
      setForm(initialFormState);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "태그 추가에 실패했습니다.");
    }
  };

  const handleStartEdit = (tag: StudentTag) => {
    setEditingTag(tag);
    setForm({ name: tag.name, color: tag.color, hiddenByDefault: tag.hidden_by_default });
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setForm(initialFormState);
  };

  const handleUpdate = async () => {
    if (!editingTag || !form.name.trim()) return;

    try {
      await updateTag({
        id: editingTag.id,
        name: form.name.trim(),
        color: form.color,
        hiddenByDefault: form.hiddenByDefault,
      });
      toast.success("태그가 수정되었습니다.");
      setEditingTag(null);
      setForm(initialFormState);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "태그 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (tag: StudentTag) => {
    if (!confirm(`"${tag.name}" 태그를 삭제하시겠습니까?\n이 태그가 지정된 학생들에서도 제거됩니다.`)) {
      return;
    }

    try {
      await deleteTag(tag.id);
      toast.success("태그가 삭제되었습니다.");
      if (editingTag?.id === tag.id) {
        setEditingTag(null);
        setForm(initialFormState);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "태그 삭제에 실패했습니다.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingTag(null);
    setForm(initialFormState);
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title="태그 관리"
      subtitle="학생에게 지정할 수 있는 태그를 관리합니다."
      footer={
        <Button variant="secondary" className="flex-1" onClick={handleClose}>
          닫기
        </Button>
      }>
      <div className="flex flex-col gap-spacing-600">
        <div className="flex flex-col gap-spacing-400 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary/50 p-spacing-500">
          <h3 className="font-semibold text-body text-content-standard-primary">
            {editingTag ? "태그 수정" : "새 태그 추가"}
          </h3>

          <FormInput
            label="태그 이름"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="태그 이름을 입력하세요"
            required
          />

          <div className="flex flex-col gap-spacing-200">
            <label className="block font-semibold text-content-standard-primary text-label">
              색상 <span className="text-core-status-negative">*</span>
            </label>
            <div className="flex flex-wrap gap-spacing-200">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`size-8 rounded-radius-full transition-all ${TAG_SOLID_COLORS[color]} ${
                    form.color === color ? "ring-2 ring-offset-2 ring-offset-components-fill-standard-primary" : ""
                  } hover:scale-110`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-spacing-300">
            <input
              type="checkbox"
              checked={form.hiddenByDefault}
              onChange={(e) => setForm({ ...form, hiddenByDefault: e.target.checked })}
              className="size-5 cursor-pointer rounded-radius-200 border-line-outline accent-core-accent"
            />
            <span className="font-medium text-body text-content-standard-primary">기본으로 숨김</span>
            <span className="text-content-standard-tertiary text-footnote">
              (이 태그가 있는 학생은 기본적으로 목록에서 숨겨집니다)
            </span>
          </label>

          <div className="flex gap-spacing-300">
            {editingTag ? (
              <>
                <Button variant="secondary" className="flex-1" onClick={handleCancelEdit} disabled={isProcessing}>
                  취소
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleUpdate}
                  disabled={!form.name.trim() || isProcessing}
                  isLoading={isUpdating}
                  loadingText="수정 중...">
                  수정
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreate}
                disabled={!form.name.trim() || isProcessing}
                isLoading={isCreating}
                loadingText="추가 중...">
                추가
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-spacing-300">
          <h3 className="font-semibold text-body text-content-standard-primary">등록된 태그</h3>

          {isLoading ? (
            <TagListSkeleton count={4} />
          ) : tags.length === 0 ? (
            <div className="rounded-radius-400 border border-line-divider bg-components-fill-standard-secondary/30 py-spacing-600 text-center text-content-standard-tertiary text-label">
              등록된 태그가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-spacing-200">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center justify-between rounded-radius-300 border p-spacing-300 transition-colors ${
                    editingTag?.id === tag.id
                      ? "border-core-accent bg-core-accent-translucent"
                      : "border-line-outline bg-components-fill-standard-primary hover:bg-components-interactive-hover"
                  }`}>
                  <div className="flex items-center gap-spacing-300">
                    <span
                      className={`inline-flex items-center rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-label ${TAG_COLOR_STYLES[tag.color].bg} ${TAG_COLOR_STYLES[tag.color].text}`}>
                      {tag.name}
                    </span>
                    {tag.hidden_by_default && (
                      <span className="text-content-standard-tertiary text-footnote">(기본 숨김)</span>
                    )}
                  </div>
                  <div className="flex gap-spacing-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartEdit(tag)}
                      disabled={isProcessing || editingTag?.id === tag.id}>
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(tag)}
                      disabled={isProcessing}
                      isLoading={isDeleting}
                      loadingText="삭제 중...">
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
