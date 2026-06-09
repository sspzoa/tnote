"use client";

import { Save, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Select } from "@/shared/components/ui";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import type { MessageTemplate } from "../(hooks)/useMessageTemplates";
import TemplateManageModal from "./TemplateManageModal";
import TemplateSaveModal from "./TemplateSaveModal";

interface TemplateSelectorProps {
  templates: MessageTemplate[];
  currentContent: string;
  onSelect: (content: string) => void;
  onSave: (name: string, content: string) => Promise<unknown>;
  onDelete: (id: string) => void;
}

export default function TemplateSelector({
  templates,
  currentContent,
  onSelect,
  onSave,
  onDelete,
}: TemplateSelectorProps) {
  const confirm = useConfirm();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleSave = async (name: string) => {
    await onSave(name, currentContent);
  };

  const matchingTemplate = templates.find((t) => t.content === currentContent);

  const handleDeleteMatching = async () => {
    if (!matchingTemplate) return;
    const ok = await confirm({
      title: "템플릿 삭제",
      message: `"${matchingTemplate.name}" 템플릿을 삭제하시겠습니까?`,
      variant: "danger",
      confirmLabel: "삭제",
    });
    if (ok) {
      onDelete(matchingTemplate.id);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value=""
        onValueChange={(value) => {
          const template = templates.find((t) => t.id === value);
          if (template) {
            onSelect(template.content);
          }
        }}
        placeholder={`템플릿 불러오기 (${templates.length}개)`}
        options={templates.map((template) => ({ value: template.id, label: template.name }))}
        className="flex-1"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsSaveModalOpen(true)}
        disabled={!currentContent.trim()}
        title="현재 메시지를 템플릿으로 저장">
        <span className="flex items-center gap-2">
          <Save className="size-4" />
          저장
        </span>
      </Button>

      {matchingTemplate ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteMatching}
          title={`"${matchingTemplate.name}" 템플릿 삭제`}>
          <span className="flex items-center gap-2">
            <Trash2 className="size-4" />
            삭제
          </span>
        </Button>
      ) : (
        templates.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setIsManageModalOpen(true)} title="템플릿 관리">
            <span className="flex items-center gap-2">
              <Settings className="size-4" />
              관리
            </span>
          </Button>
        )
      )}

      <TemplateSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        content={currentContent}
      />

      <TemplateManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        templates={templates}
        onDelete={onDelete}
      />
    </div>
  );
}
