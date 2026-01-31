"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ConsultationInfo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  creator: { id: string; name: string } | null;
}

interface ConsultationCardProps {
  consultation: ConsultationInfo;
}

export const ConsultationCard = ({ consultation }: ConsultationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-line-divider border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-spacing-300 px-spacing-500 py-spacing-400 text-left transition-colors hover:bg-components-fill-standard-secondary">
        <span className="min-w-0 flex-1 truncate font-medium text-body text-content-standard-primary">
          {consultation.title}
        </span>
        <div className="flex shrink-0 items-center gap-spacing-200">
          {consultation.creator && (
            <span className="text-content-standard-secondary text-footnote">{consultation.creator.name}</span>
          )}
          <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
            {new Date(consultation.createdAt).toLocaleDateString("ko-KR")}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-content-standard-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="border-line-divider border-t px-spacing-500 py-spacing-400">
            <p className="whitespace-pre-wrap text-body text-content-standard-secondary">{consultation.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
