import { type InputHTMLAttributes, useId } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export function FormInput({ label, required = false, error, className = "", id, ...props }: FormInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
        {label} {required && <span className="text-core-status-negative">*</span>}
      </label>
      <input
        id={inputId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        aria-required={required}
        className={`w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${error ? "border-core-status-negative" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-spacing-100 text-core-status-negative text-label" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
