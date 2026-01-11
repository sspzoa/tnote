"use client";

import { useAtom } from "jotai";
import { absentNoteAtom } from "../(atoms)/useFormStore";
import { showAbsentModalAtom } from "../(atoms)/useModalStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeAbsent } from "../(hooks)/useRetakeAbsent";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";

interface RetakeAbsentModalProps {
  onSuccess?: () => void;
}

export default function RetakeAbsentModal({ onSuccess }: RetakeAbsentModalProps) {
  const [isOpen, setIsOpen] = useAtom(showAbsentModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const [absentNote, setAbsentNote] = useAtom(absentNoteAtom);
  const { markAbsent } = useRetakeAbsent();
  const { refetch: refetchHistory } = useRetakeHistory(selectedRetake?.id || null);

  const handleClose = () => {
    setIsOpen(false);
    setAbsentNote("");
  };

  const handleAbsent = async () => {
    if (!selectedRetake) return;

    try {
      await markAbsent({
        retakeId: selectedRetake.id,
        data: { note: absentNote || null },
      });
      alert("결석 처리되었습니다.");
      await refetchHistory();
      handleClose();
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "결석 처리에 실패했습니다.");
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
          <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">결석 처리</h2>
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
                결석 사유 (선택사항)
              </label>
              <textarea
                value={absentNote}
                onChange={(e) => setAbsentNote(e.target.value)}
                rows={3}
                placeholder="결석 사유를 입력하세요"
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
            onClick={handleAbsent}
            className="flex-1 rounded-radius-400 bg-core-status-negative px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90">
            결석 처리
          </button>
        </div>
      </div>
    </div>
  );
}
