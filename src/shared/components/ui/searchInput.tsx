import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

type SearchInputSize = "md" | "lg";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  placeholder?: string;
  size?: SearchInputSize;
}

const sizeStyles: Record<SearchInputSize, string> = {
  md: "h-9",
  lg: "h-10",
};

export function SearchInput({ placeholder = "검색...", size = "md", className = "", ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "peer w-full rounded-lg border border-input bg-muted/50 pr-4 pl-9.5 text-sm shadow-well outline-none transition-[color,box-shadow,background-color] duration-[--motion-fast] placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:bg-card focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-input/30",
          sizeStyles[size],
          className,
        )}
        {...props}
      />
      <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground transition-[color,transform] duration-[--motion-fast] peer-focus-visible:scale-110 peer-focus-visible:text-primary" />
    </div>
  );
}
