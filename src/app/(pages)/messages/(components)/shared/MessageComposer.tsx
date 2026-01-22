"use client";

import { Info } from "lucide-react";
import type { MessageTemplate } from "../../(hooks)/useMessageTemplates";
import type { TemplateVariable } from "../../(utils)/messageUtils";
import { getByteLength, getMessageType } from "../../(utils)/messageUtils";
import TemplateSelector from "../TemplateSelector";

interface MessageComposerProps {
  messageText: string;
  onMessageChange: (text: string) => void;
  templateVariables: TemplateVariable[];
  templates: MessageTemplate[];
  onSaveTemplate: (name: string, content: string) => Promise<unknown>;
  onDeleteTemplate: (id: string) => Promise<unknown>;
  className?: string;
}

export default function MessageComposer({
  messageText,
  onMessageChange,
  templateVariables,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  className = "",
}: MessageComposerProps) {
  const byteLength = getByteLength(messageText);
  const { isLMS, maxBytes } = getMessageType(byteLength);

  const handleTextChange = (value: string) => {
    if (getByteLength(value) <= 2000) {
      onMessageChange(value);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-spacing-300 flex items-center justify-between">
        <label className="font-semibold text-content-standard-primary text-label">메시지 내용</label>
        <div className="flex items-center gap-spacing-300">
          <span
            className={`rounded-radius-200 px-spacing-200 py-spacing-100 font-semibold text-footnote ${
              isLMS ? "bg-solid-translucent-yellow text-solid-yellow" : "bg-solid-translucent-blue text-solid-blue"
            }`}>
            {isLMS ? "LMS" : "SMS"}
          </span>
          <span className="text-content-standard-tertiary text-footnote">
            {byteLength} / {maxBytes} bytes
          </span>
        </div>
      </div>

      <TemplateSelector
        templates={templates}
        currentContent={messageText}
        onSelect={onMessageChange}
        onSave={onSaveTemplate}
        onDelete={onDeleteTemplate}
      />

      <textarea
        value={messageText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="mt-spacing-300 min-h-32 flex-1 resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none"
      />

      <div className="mt-spacing-300 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
        <div className="mb-spacing-200 flex items-center gap-spacing-200">
          <Info className="size-4 text-content-standard-tertiary" />
          <span className="font-semibold text-content-standard-secondary text-footnote">사용 가능한 변수</span>
        </div>
        <div className="flex flex-wrap gap-spacing-200">
          {templateVariables.map((variable) => (
            <button
              key={variable.key}
              onClick={() => onMessageChange(messageText + variable.key)}
              className="rounded-radius-200 bg-components-fill-standard-primary px-spacing-200 py-spacing-100 text-content-standard-secondary text-footnote transition-all hover:bg-core-accent-translucent hover:text-core-accent"
              title={variable.description}>
              {variable.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
