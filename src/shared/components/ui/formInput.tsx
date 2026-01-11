import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export function FormInput({ label, required = false, error, className = "", ...props }: FormInputProps) {
  return (
    <div>
      <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
        {label} {required && <span className="text-core-status-negative">*</span>}
      </label>
      <input
        className={`w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${error ? "border-core-status-negative" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-spacing-100 text-core-status-negative text-label">{error}</p>}
    </div>
  );
}
