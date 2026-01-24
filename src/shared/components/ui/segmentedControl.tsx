import type { LucideIcon } from "lucide-react";

interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  const activeIndex = items.findIndex((item) => item.value === value);
  const count = items.length;

  return (
    <div
      className={`relative flex rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-100 ${className}`}>
      <div
        className="absolute top-spacing-100 h-[calc(100%-8px)] rounded-radius-300 bg-core-accent transition-all duration-200"
        style={{
          width: `calc(${100 / count}% - ${((count + 1) / count) * 4}px)`,
          left: `calc(${(100 / count) * activeIndex}% + 4px)`,
        }}
      />
      {items.map((item) => {
        const isActive = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-spacing-200 rounded-radius-300 py-spacing-300 font-semibold text-body transition-colors duration-200 ${
              isActive ? "text-solid-white" : "text-content-standard-secondary hover:text-content-standard-primary"
            }`}>
            {Icon && <Icon className="size-5" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
