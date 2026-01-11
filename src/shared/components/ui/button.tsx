import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-core-accent text-solid-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "bg-components-fill-standard-secondary text-content-standard-primary hover:bg-components-interactive-hover disabled:cursor-not-allowed disabled:opacity-50",
  danger: "bg-core-status-negative text-solid-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  success: "bg-core-status-positive text-solid-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-spacing-300 py-spacing-200 text-label",
  md: "px-spacing-500 py-spacing-300 text-body",
  lg: "px-spacing-600 py-spacing-400 text-title",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`rounded-radius-300 font-semibold transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}>
      {isLoading ? loadingText || children : children}
    </button>
  );
}
