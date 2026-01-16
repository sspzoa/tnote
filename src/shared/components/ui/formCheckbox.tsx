import type { InputHTMLAttributes } from "react";

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function FormCheckbox({ label, className = "", ...props }: FormCheckboxProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-spacing-200">
      <input
        type="checkbox"
        className={`size-4 cursor-pointer rounded-radius-100 border border-line-outline bg-components-fill-standard-secondary text-core-accent transition-all duration-150 checked:border-core-accent checked:bg-core-accent focus:ring-2 focus:ring-core-accent-translucent group-hover:border-core-accent/50 ${className}`}
        {...props}
      />
      <span className="text-body text-content-standard-primary transition-colors duration-150 group-hover:text-core-accent">
        {label}
      </span>
    </label>
  );
}

interface FormCheckboxGroupProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormCheckboxGroup({ label, required = false, children }: FormCheckboxGroupProps) {
  return (
    <div>
      <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
        {label} {required && <span className="text-core-status-negative">*</span>}
      </label>
      <div className="space-y-spacing-200">{children}</div>
    </div>
  );
}
