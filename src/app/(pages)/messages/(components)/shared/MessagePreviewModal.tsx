"use client";

import { MessageSquareText } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { StatStrip } from "@/shared/components/ui/statStrip";

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
      footer={
        <Button className="ml-auto" onClick={onClose}>
          확인
        </Button>
      }>
      <div className="flex flex-col gap-5">
        {recipientName && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-base text-foreground">{recipientName} 학생</span>
            <span className="text-muted-foreground text-xs">발송될 메시지</span>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 border-border border-b bg-feature-messages-soft px-4 py-2.5 text-feature-messages">
            <MessageSquareText className="size-4" />
            <span className="font-semibold text-xs">메시지 내용</span>
          </div>
          <p className="whitespace-pre-wrap p-4 text-[15px] text-foreground leading-relaxed">{previewMessage}</p>
        </div>

        {variables.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-muted-foreground text-xs">적용된 변수</p>
            <StatStrip
              orientation="vertical"
              items={variables.map((variable) => ({
                label: variable.label,
                value: variable.value ?? "-",
              }))}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
