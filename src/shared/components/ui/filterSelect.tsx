import type { SelectHTMLAttributes } from "react";

interface FilterSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  children: React.ReactNode;
}

export function FilterSelect({ children, disabled, ...props }: FilterSelectProps) {
  return (
    <select
      className={`rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      disabled={disabled}
      {...props}>
      {children}
    </select>
  );
}
