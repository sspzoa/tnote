"use client";

import { Save } from "lucide-react";
import { useState } from "react";
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
      <select
        value=""
        onChange={(e) => {
          const template = templates.find((t) => t.id === e.target.value);
          if (template) {
            onSelect(template.name, template.content);
          }
        }}
        className="flex-1 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-body text-content-standard-primary focus:border-core-accent focus:outline-none">
        <option value="">템플릿 불러오기 ({templates.length}개)</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setIsSaveModalOpen(true)}
        disabled={!currentContent.trim()}
        className="flex items-center gap-spacing-200 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-content-standard-primary text-label transition-all hover:border-core-accent/30 hover:bg-components-interactive-hover disabled:cursor-not-allowed disabled:opacity-50"
        title="현재 내용을 템플릿으로 저장">
        <Save className="size-4" />
        저장
      </button>

      {templates.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value && confirm("이 템플릿을 삭제하시겠습니까?")) {
              onDelete(e.target.value);
            }
          }}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 text-body text-content-standard-primary focus:border-core-accent focus:outline-none">
          <option value="">삭제</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
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
