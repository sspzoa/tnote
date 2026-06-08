"use client";

import { FilterButton } from "@/shared/components/ui/filterButton";
import type { RecipientType } from "@/shared/types";
import { RECIPIENT_OPTIONS } from "../../(utils)/messageUtils";

interface RecipientTypeSelectorProps {
  value: RecipientType;
  onChange: (value: RecipientType) => void;
}

export default function RecipientTypeSelector({ value, onChange }: RecipientTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3 border-border border-b px-5 py-4">
      <label className="block font-semibold text-foreground text-sm">수신자 유형</label>
      <div className="flex flex-wrap gap-2">
        {RECIPIENT_OPTIONS.map((option) => (
          <FilterButton key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}
