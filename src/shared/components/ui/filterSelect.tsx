"use client";

import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils/cn";

type FilterOption = { value: string; label: string };

interface FilterSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** Compact, filter-bar styled Radix Select. Options-based; an empty-value option becomes the placeholder. */
export function FilterSelect({ value, onValueChange, options, placeholder, disabled, className }: FilterSelectProps) {
  const placeholderOption = options.find((option) => option.value === "");
  const items = options.filter((option) => option.value !== "");

  return (
    <SelectRoot value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size="sm" className={cn("w-auto font-medium", className)}>
        <SelectValue placeholder={placeholder ?? placeholderOption?.label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
