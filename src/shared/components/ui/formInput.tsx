import { type InputHTMLAttributes, useId } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  required?: boolean;
  error?: string;
  id?: string;
}

export function FormInput({ label, required = false, error, className, id, ...props }: FormInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex flex-col gap-1">
        <Input
          id={inputId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-required={required}
          error={!!error}
          className={className}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-destructive text-xs" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
