import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/selectField";

interface FormSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function FormSelect({ label, required = false, error, options, className, ...props }: FormSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label className="font-semibold text-foreground text-sm">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex flex-col gap-1">
        <Select error={!!error} options={options} className={className} {...props} />
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </div>
  );
}
