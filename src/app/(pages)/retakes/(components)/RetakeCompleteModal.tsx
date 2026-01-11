"use client";

import { useAtom } from "jotai";
import { completeNoteAtom } from "../(atoms)/useFormStore";
import { showCompleteModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeComplete } from "../(hooks)/useRetakeComplete";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

interface RetakeCompleteModalProps {
  onSuccess?: () => void;
}

export default function RetakeCompleteModal({ onSuccess }: RetakeCompleteModalProps) {
  const [isOpen, setIsOpen] = useAtom(showCompleteModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [completeNote, setCompleteNote] = useAtom(completeNoteAtom);
  const { completeRetake } = useRetakeComplete();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);

  const handleClose = () => {
    setIsOpen(false);
    setCompleteNote("");
  };

  const handleComplete = async () => {
    if (!selectedRetake) return;

    try {
      await completeRetake({
        retakeId: selectedRetake.id,
        data: { note: completeNote || null },
      });
      alert("완료 처리되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "완료 처리에 실패했습니다.");
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
          <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">완료 처리</h2>
          <div className="text-body text-content-standard-secondary">
            {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
            {selectedRetake.exam.exam_number}회차
          </div>
        </div>

        <div className="p-spacing-600">
          <div className="space-y-spacing-400">
            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                예정일
              </label>
              <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
                {selectedRetake.current_scheduled_date}
              </div>
            </div>

            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                메모 (선택사항)
              </label>
              <textarea
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
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
            onClick={handleComplete}
            className="flex-1 rounded-radius-400 bg-core-status-positive px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90">
            완료 처리
          </button>
        </div>
      </div>
    </div>
  );
}
