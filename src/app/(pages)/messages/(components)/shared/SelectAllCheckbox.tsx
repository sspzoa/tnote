"use client";

import { Check, Minus } from "lucide-react";

interface SelectAllCheckboxProps {
  allSelected: boolean;
  someSelected: boolean;
  totalCount: number;
  onToggle: () => void;
  unit?: string;
}

export default function SelectAllCheckbox({
  allSelected,
  someSelected,
  totalCount,
  onToggle,
  unit = "명",
}: SelectAllCheckboxProps) {
  return (
    <div className="border-border border-b bg-muted/50 px-4 py-2.5">
      <button onClick={onToggle} className="group flex w-full items-center gap-3 rounded-sm">
        <div
          className={`flex size-5 items-center justify-center rounded-sm border transition-all ${
            allSelected
              ? "border-primary bg-primary"
              : someSelected
                ? "border-primary bg-primary/50"
                : "border-border bg-muted group-hover:border-primary/50"
          }`}>
          {allSelected ? (
            <Check className="size-3 text-primary-foreground" />
          ) : someSelected ? (
            <Minus className="size-3 text-primary-foreground" />
          ) : null}
        </div>
        <span className="font-medium text-foreground text-sm">
          {allSelected ? "전체 해제" : "전체 선택"}{" "}
          <span className="text-muted-foreground">
            ({totalCount}
            {unit})
          </span>
        </span>
      </button>
    </div>
  );
}
