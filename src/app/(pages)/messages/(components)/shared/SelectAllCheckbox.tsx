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
    <div className="border-line-divider border-b bg-components-fill-standard-secondary/50 px-spacing-500 py-spacing-300">
      <button onClick={onToggle} className="group flex w-full items-center gap-spacing-300 rounded-radius-200">
        <div
          className={`flex size-5 items-center justify-center rounded-radius-100 border transition-all ${
            allSelected
              ? "border-core-accent bg-core-accent"
              : someSelected
                ? "border-core-accent bg-core-accent/50"
                : "border-line-outline bg-components-fill-standard-secondary group-hover:border-core-accent/50"
          }`}>
          {allSelected ? (
            <Check className="size-3 text-solid-white" />
          ) : someSelected ? (
            <Minus className="size-3 text-solid-white" />
          ) : null}
        </div>
        <span className="font-medium text-body text-content-standard-primary">
          {allSelected ? "전체 해제" : "전체 선택"}{" "}
          <span className="text-content-standard-tertiary">
            ({totalCount}
            {unit})
          </span>
        </span>
      </button>
    </div>
  );
}
