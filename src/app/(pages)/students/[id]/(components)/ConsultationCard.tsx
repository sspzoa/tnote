"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { formatLocaleDateKorean } from "@/shared/lib/utils/date";

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
    <div className="print-break-inside-avoid border-border border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 print:px-0 print:py-2">
        <span className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">{consultation.title}</span>
        <div className="flex shrink-0 items-center gap-2">
          {consultation.creator && <span className="text-muted-foreground text-xs">{consultation.creator.name}</span>}
          <Badge variant="blue" size="xs">
            {formatLocaleDateKorean(consultation.createdAt)}
          </Badge>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 print:hidden ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div
        className="print-expand grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
        <div className="overflow-hidden print:overflow-visible">
          <div className="border-border border-t px-4 py-3 print:px-0 print:py-2">
            <p className="whitespace-pre-wrap text-muted-foreground text-sm">{consultation.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
