"use client";

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
    <div className="flex flex-col gap-spacing-200">
      <label className="block font-semibold text-content-standard-primary text-label">
        {label} {required && <span className="text-core-status-negative">*</span>}
      </label>
      <div className="grid grid-cols-7 gap-spacing-200">
        {dayNames.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggleDay(index)}
            className={`rounded-radius-300 py-spacing-200 font-medium text-footnote transition-all duration-150 ${
              selectedDays.includes(index)
                ? "bg-core-accent text-solid-white"
                : "border border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary hover:border-core-accent/30 hover:bg-components-interactive-hover"
            }`}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
