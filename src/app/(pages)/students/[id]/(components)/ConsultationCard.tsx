"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils/cn";
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
        aria-expanded={isExpanded}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 print:px-0 print:py-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-semibold text-foreground text-sm">{consultation.title}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            {consultation.creator && (
              <span className="font-medium text-foreground/70">{consultation.creator.name}</span>
            )}
            {consultation.creator && <span className="text-muted-foreground/40">·</span>}
            <span className="tabular-nums">{formatLocaleDateKorean(consultation.createdAt)}</span>
          </span>
          {!isExpanded && (
            <p className="mt-1 line-clamp-1 text-muted-foreground/80 text-sm print:hidden">{consultation.content}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 print:hidden",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      <div
        className="print-expand grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
        <div className="overflow-hidden print:overflow-visible">
          <div className="px-4 pb-4 print:px-0 print:py-2">
            <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3.5 text-foreground text-sm leading-relaxed print:bg-transparent print:p-0">
              {consultation.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
