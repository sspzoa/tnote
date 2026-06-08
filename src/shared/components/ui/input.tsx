import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

type InputSize = "sm" | "md" | "lg";

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 px-3 py-1 text-sm",
  md: "h-9 px-3 py-1 text-base md:text-sm",
  lg: "h-10 px-4 py-2 text-base",
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
        "flex w-full min-w-0 rounded-md border border-input bg-transparent shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}

export { Input };
