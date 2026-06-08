import type { TextareaHTMLAttributes } from "react";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export function FormTextarea({ label, required = false, error, className, ...props }: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label className="text-sm font-semibold text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex flex-col gap-1">
        <Textarea error={!!error} className={className} {...props} />
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </div>
  );
}
