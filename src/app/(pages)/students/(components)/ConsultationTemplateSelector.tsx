"use client";

import { Save, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Select } from "@/shared/components/ui";
import type { ConsultationTemplate } from "@/shared/types";
import ConsultationTemplateManageModal from "./ConsultationTemplateManageModal";
import ConsultationTemplateSaveModal from "./ConsultationTemplateSaveModal";

interface ConsultationTemplateSelectorProps {
  templates: ConsultationTemplate[];
  currentTitle: string;
  currentContent: string;
  onSelect: (title: string, content: string) => void;
  onSave: (name: string, content: string) => Promise<unknown>;
  onDelete: (id: string) => void;
}

export default function ConsultationTemplateSelector({
  templates,
  currentTitle,
  currentContent,
  onSelect,
  onSave,
  onDelete,
}: ConsultationTemplateSelectorProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleSave = async (name: string) => {
    await onSave(name, currentContent);
  };

  const matchingTemplate = templates.find((t) => t.content === currentContent);

  const handleDeleteMatching = () => {
    if (matchingTemplate && confirm(`"${matchingTemplate.name}" 템플릿을 삭제하시겠습니까?`)) {
      onDelete(matchingTemplate.id);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-spacing-300">
      <Select
        value=""
        onChange={(e) => {
          const template = templates.find((t) => t.id === e.target.value);
          if (template) {
            onSelect(template.name, template.content);
          }
        }}
        placeholder={`템플릿 불러오기 (${templates.length}개)`}
        options={templates.map((template) => ({ value: template.id, label: template.name }))}
        className="flex-1"
      />

      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={() => setIsSaveModalOpen(true)}
        disabled={!currentContent.trim()}
        title="현재 내용을 템플릿으로 저장">
        <span className="flex items-center gap-spacing-200">
          <Save className="size-4" />
          저장
        </span>
      </Button>

      {matchingTemplate ? (
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={handleDeleteMatching}
          title={`"${matchingTemplate.name}" 템플릿 삭제`}>
          <span className="flex items-center gap-spacing-200">
            <Trash2 className="size-4" />
            삭제
          </span>
        </Button>
      ) : (
        templates.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => setIsManageModalOpen(true)}
            title="템플릿 관리">
            <span className="flex items-center gap-spacing-200">
              <Settings className="size-4" />
              관리
            </span>
          </Button>
        )
      )}

      <ConsultationTemplateSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        defaultName={currentTitle}
        content={currentContent}
      />

      <ConsultationTemplateManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        templates={templates}
        onDelete={onDelete}
      />
    </div>
  );
}
