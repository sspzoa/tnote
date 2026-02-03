import type { InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  error?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "px-spacing-300 py-spacing-200 text-body",
  md: "px-spacing-400 py-spacing-300 text-body",
  lg: "px-spacing-500 py-spacing-400 text-body",
};

export function Input({ size = "sm", error = false, className = "", ...props }: InputProps) {
  return (
    <input
      className={`rounded-radius-300 border bg-components-fill-standard-secondary text-content-standard-primary transition-all placeholder:text-content-standard-quaternary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${
        error ? "border-core-status-negative" : "border-line-outline"
      } ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
