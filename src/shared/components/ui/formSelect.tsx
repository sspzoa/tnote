import type { SelectHTMLAttributes } from "react";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, required = false, error, options, className = "", ...props }: FormSelectProps) {
  return (
    <div>
      <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
        {label} {required && <span className="text-core-status-negative">*</span>}
      </label>
      <select
        className={`w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${error ? "border-core-status-negative" : ""} ${className}`}
        {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-spacing-100 text-core-status-negative text-label">{error}</p>}
    </div>
  );
}
