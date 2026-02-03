"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button, Select } from "@/shared/components/ui";
import type { ConsultationTemplate } from "@/shared/types";
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

  const handleSave = async (name: string) => {
    await onSave(name, currentContent);
  };

  return (
    <div className="flex items-center gap-spacing-300">
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

      {templates.length > 0 && (
        <Select
          value=""
          onChange={(e) => {
            if (e.target.value && confirm("이 템플릿을 삭제하시겠습니까?")) {
              onDelete(e.target.value);
            }
          }}
          placeholder="삭제"
          options={templates.map((template) => ({ value: template.id, label: template.name }))}
        />
      )}

      <ConsultationTemplateSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        defaultName={currentTitle}
        content={currentContent}
      />
    </div>
  );
}
