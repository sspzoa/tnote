"use client";

import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";

interface PreviewVariable {
  label: string;
  value: string | number | null | undefined;
}

interface MessagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
  previewMessage: string;
  variables: PreviewVariable[];
}

export default function MessagePreviewModal({
  isOpen,
  onClose,
  recipientName,
  previewMessage,
  variables,
}: MessagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="메시지 미리보기"
      subtitle={recipientName ? `${recipientName} 학생에게 발송될 메시지입니다` : undefined}
      footer={
        <Button className="ml-auto" onClick={onClose}>
          확인
        </Button>
      }>
      <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-400">
        <p className="whitespace-pre-wrap text-body text-content-standard-primary">{previewMessage}</p>
      </div>
      {variables.length > 0 && (
        <div className="mt-spacing-400 rounded-radius-300 bg-solid-translucent-blue p-spacing-400">
          <p className="font-semibold text-label text-solid-blue">적용된 변수</p>
          <div className="mt-spacing-200 grid grid-cols-2 gap-spacing-200 text-content-standard-secondary text-footnote">
            {variables.map((variable) => (
              <span key={variable.label}>
                {variable.label}: {variable.value ?? "-"}
              </span>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
