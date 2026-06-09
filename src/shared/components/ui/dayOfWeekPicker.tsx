"use client";

import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

interface DayOfWeekPickerProps {
  label: string;
  required?: boolean;
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

export function DayOfWeekPicker({ label, required = false, selectedDays, onChange }: DayOfWeekPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <ToggleGroup
        type="multiple"
        variant="outline"
        aria-label={label}
        value={selectedDays.map(String)}
        onValueChange={(values) => onChange(values.map(Number).sort((a, b) => a - b))}
        className="grid w-full grid-cols-7">
        {dayNames.map((day, index) => (
          <ToggleGroupItem key={day} value={String(index)} aria-label={day} className="text-xs">
            {day}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
