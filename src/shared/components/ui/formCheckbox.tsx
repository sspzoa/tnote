import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function FormCheckbox({ label, className, ...props }: FormCheckboxProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className={cn(
          "size-4 cursor-pointer rounded-sm border border-input outline-none accent-primary transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className,
        )}
        {...props}
      />
      <span className="text-base text-foreground transition-colors group-hover:text-primary">{label}</span>
    </label>
  );
}
