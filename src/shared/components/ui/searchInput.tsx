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
      <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-input bg-transparent pr-3 pl-9 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    </div>
  );
}
