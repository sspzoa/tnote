import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "ghost" | "outline" | "filled";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:
    "text-content-standard-tertiary hover:bg-components-fill-standard-secondary hover:text-content-standard-primary active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-content-standard-tertiary disabled:active:scale-100",
  outline:
    "border border-line-outline text-content-standard-tertiary hover:border-core-accent/30 hover:bg-components-interactive-hover hover:text-content-standard-primary active:scale-95 disabled:opacity-50 disabled:hover:border-line-outline disabled:hover:bg-transparent disabled:active:scale-100",
  filled:
    "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover hover:text-content-standard-primary active:scale-95 disabled:opacity-50 disabled:hover:bg-components-fill-standard-secondary disabled:active:scale-100",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "p-spacing-100 rounded-radius-200",
  md: "p-spacing-200 rounded-radius-200",
  lg: "p-spacing-300 rounded-radius-300",
};

export function IconButton({ variant = "ghost", size = "md", children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      className={`transition-all duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}>
      {children}
    </button>
  );
}
