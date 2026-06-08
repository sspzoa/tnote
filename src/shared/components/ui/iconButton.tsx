import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

type IconButtonVariant = "ghost" | "outline" | "filled";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:active:scale-100",
  outline:
    "border border-border text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground active:scale-95 disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent disabled:active:scale-100",
  filled:
    "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95 disabled:opacity-50 disabled:hover:bg-muted disabled:active:scale-100",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "p-1 rounded-sm",
  md: "p-2 rounded-sm",
  lg: "p-3 rounded-md",
};

export function IconButton({ variant = "ghost", size = "md", children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      className={cn("transition-all duration-150", variantStyles[variant], sizeStyles[size], className)}
      {...props}>
      {children}
    </button>
  );
}
