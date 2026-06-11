"use client";

import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils/cn";

type SelectSize = "sm" | "md" | "lg";
type SelectOption = { value: string; label: string };

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: SelectSize;
  error?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-9",
  md: "h-10",
  lg: "h-11",
};

/**
 * Options-based convenience wrapper over the Radix shadcn Select primitives.
 * An option with an empty value (the legacy `{ value: "" }` placeholder pattern) is treated as the
 * placeholder text — Radix forbids empty-string item values, so it is never rendered as an item.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  size = "md",
  error = false,
  disabled,
  name,
  className,
}: SelectProps) {
  const placeholderOption = options.find((option) => option.value === "");
  const items = options.filter((option) => option.value !== "");
  const resolvedPlaceholder = placeholder ?? placeholderOption?.label;

  return (
    <SelectRoot value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
      <SelectTrigger aria-invalid={error || undefined} className={cn("w-full", sizeStyles[size], className)}>
        <SelectValue placeholder={resolvedPlaceholder} />
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
