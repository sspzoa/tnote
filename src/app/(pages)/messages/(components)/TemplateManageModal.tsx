"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { Modal } from "@/shared/components/ui/modal";
import type { MessageTemplate } from "../(hooks)/useMessageTemplates";

interface TemplateManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onDelete: (id: string) => void;
}

export default function TemplateManageModal({ isOpen, onClose, templates, onDelete }: TemplateManageModalProps) {
  const confirm = useConfirm();

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "템플릿 삭제",
      message: `"${name}" 템플릿을 삭제하시겠습니까?`,
      variant: "danger",
      confirmLabel: "삭제",
    });
    if (ok) {
      onDelete(id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="템플릿 관리"
      subtitle={`총 ${templates.length}개의 템플릿`}
      footer={
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          닫기
        </Button>
      }>
      {templates.length === 0 ? (
        <p className="py-4 text-center text-base text-muted-foreground">저장된 템플릿이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold text-base text-foreground">{template.name}</span>
                <p className="line-clamp-2 text-muted-foreground text-xs">{template.content}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(template.id, template.name)}
                title="템플릿 삭제">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
