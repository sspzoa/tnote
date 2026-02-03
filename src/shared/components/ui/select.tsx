import type { SelectHTMLAttributes } from "react";

type SelectSize = "sm" | "md" | "lg";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: SelectSize;
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "px-spacing-300 py-spacing-200 text-body",
  md: "px-spacing-400 py-spacing-300 text-body",
  lg: "px-spacing-500 py-spacing-400 text-body",
};

export function Select({ size = "sm", error = false, options, placeholder, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`rounded-radius-300 border bg-components-fill-standard-secondary text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${
        error ? "border-core-status-negative" : "border-line-outline"
      } ${sizeStyles[size]} ${className}`}
      {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
