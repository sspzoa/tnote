import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

type TextareaProps = ComponentProps<"textarea"> & {
  error?: boolean;
};

function Textarea({ className, error = false, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={error || undefined}
      className={cn(
        "field-sizing-content flex min-h-16 w-full rounded-xl border border-transparent bg-muted/60 px-3.5 py-2.5 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        "focus-visible:border-ring focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
