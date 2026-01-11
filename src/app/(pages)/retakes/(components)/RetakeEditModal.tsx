"use client";

import { useAtom } from "jotai";
import { editDateAtom, editNoteAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeUpdate } from "../(hooks)/useRetakeUpdate";

export default function RetakeEditModal() {
  const [isOpen, setIsOpen] = useAtom(showEditModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [editDate, setEditDate] = useAtom(editDateAtom);
  const [editNote, setEditNote] = useAtom(editNoteAtom);
  const { updateRetake } = useRetakeUpdate();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedRetake || !editDate) {
      alert("날짜를 입력해주세요.");
      return;
    }

    try {
      await updateRetake({
        retakeId: selectedRetake.id,
        data: {
          scheduledDate: editDate,
          note: editNote || null,
        },
      });
      alert("재시험 정보가 수정되었습니다.");
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "수정에 실패했습니다.");
    }
  };

  if (!isOpen || !selectedRetake) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">재시험 수정</h2>
          <div className="text-body text-content-standard-secondary">
            {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
            {selectedRetake.exam.exam_number}회차
          </div>
        </div>

        <div className="p-spacing-600">
          <div className="space-y-spacing-400">
            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                예정일 <span className="text-core-status-negative">*</span>
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>

            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                메모 (선택사항)
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
                placeholder="메모를 입력하세요"
                className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={handleClose}
            className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          <button
            onClick={handleEdit}
            disabled={!editDate}
            className="flex-1 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
