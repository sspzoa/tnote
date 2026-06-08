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
      <div className="rounded-md border border-border bg-muted p-4">
        <p className="whitespace-pre-wrap text-base text-foreground">{previewMessage}</p>
      </div>
      {variables.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md bg-solid-translucent-blue p-4">
          <p className="font-semibold text-sm text-solid-blue">적용된 변수</p>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
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
