import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error = false, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`rounded-radius-300 border bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${
        error ? "border-core-status-negative" : "border-line-outline"
      } ${className}`}
      {...props}
    />
  );
}
