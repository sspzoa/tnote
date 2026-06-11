"use client";

import { MessageSquareText, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { IconBadge } from "@/shared/components/ui/iconBadge";
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
        <EmptyState
          tone="messages"
          icon={<MessageSquareText />}
          message="저장된 템플릿이 없습니다."
          subtitle="자주 쓰는 문구를 템플릿으로 저장해 두면 여기에서 관리할 수 있어요."
        />
      ) : (
        <div className="-mx-1 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/50">
              <IconBadge icon={MessageSquareText} tone="messages" size="md" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-semibold text-foreground text-sm">{template.name}</span>
                <p className="line-clamp-1 text-muted-foreground text-xs">{template.content}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:bg-destructive-soft hover:text-destructive"
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
