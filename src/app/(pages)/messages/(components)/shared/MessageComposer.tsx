"use client";

import { Info } from "lucide-react";
import { Badge, Textarea } from "@/shared/components/ui";
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
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-semibold text-foreground text-sm">메시지 내용</label>
        <div className="flex items-center gap-3">
          <Badge variant={isLMS ? "yellow" : "blue"} size="xs">
            {isLMS ? "LMS" : "SMS"}
          </Badge>
          <span className="text-muted-foreground text-xs">
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

      <Textarea
        value={messageText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="min-h-32 flex-1 resize-none"
      />

      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted p-3">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-muted-foreground" />
          <span className="font-semibold text-muted-foreground text-xs">사용 가능한 변수</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {templateVariables.map((variable) => (
            <button
              key={variable.key}
              onClick={() => onMessageChange(messageText + variable.key)}
              className="rounded-sm bg-card px-2 py-1 text-muted-foreground text-xs transition-all hover:bg-accent hover:text-foreground"
              title={variable.description}>
              {variable.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
