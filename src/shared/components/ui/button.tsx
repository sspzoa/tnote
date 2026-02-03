import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "translucent";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-core-accent text-solid-white hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100",
  secondary:
    "bg-components-fill-standard-secondary text-content-standard-primary border border-line-outline hover:bg-components-interactive-hover hover:border-core-accent/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-outline disabled:active:scale-100",
  danger:
    "bg-core-status-negative text-solid-white hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100",
  success:
    "bg-core-status-positive text-solid-white hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100",
  translucent:
    "bg-solid-translucent-blue text-solid-blue hover:bg-solid-translucent-indigo active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-solid-translucent-blue disabled:active:scale-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-spacing-400 py-spacing-200 text-footnote",
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
      className={`rounded-radius-300 font-semibold transition-all duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}>
      {isLoading ? (
        <span className="flex items-center justify-center gap-spacing-200">
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
