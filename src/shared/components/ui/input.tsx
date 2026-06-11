import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

type InputSize = "sm" | "md" | "lg";

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 px-3 py-1 text-sm",
  md: "h-10 px-3.5 py-2 text-sm",
  lg: "h-11 px-3.5 py-2 text-sm",
};

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: InputSize;
  error?: boolean;
};

function Input({ className, type, size = "md", error = false, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={error || undefined}
      className={cn(
        "flex w-full min-w-0 rounded-lg border border-input bg-muted/50 shadow-well outline-none transition-[color,box-shadow,background-color] duration-[--motion-fast] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        "hover:border-border-strong focus-visible:border-ring focus-visible:bg-card focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        "aria-invalid:border-destructive aria-invalid:bg-destructive-soft/40 aria-invalid:shadow-none aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}

export { Input };
