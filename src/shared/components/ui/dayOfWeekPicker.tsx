"use client";

import { cn } from "@/shared/lib/utils/cn";

interface DayOfWeekPickerProps {
  label: string;
  required?: boolean;
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

export function DayOfWeekPicker({ label, required = false, selectedDays, onChange }: DayOfWeekPickerProps) {
  const toggleDay = (index: number) => {
    const newDays = selectedDays.includes(index)
      ? selectedDays.filter((d) => d !== index)
      : [...selectedDays, index].sort();
    onChange(newDays);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block font-semibold text-foreground text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggleDay(index)}
            className={cn(
              "rounded-md py-2 font-medium text-xs transition-all duration-150",
              selectedDays.includes(index)
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-muted text-muted-foreground hover:border-primary/30 hover:bg-accent",
            )}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
