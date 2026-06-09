import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

type SearchInputSize = "md" | "lg";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  placeholder?: string;
  size?: SearchInputSize;
}

const sizeStyles: Record<SearchInputSize, string> = {
  md: "h-10",
  lg: "h-11",
};

export function SearchInput({ placeholder = "검색...", size = "md", className = "", ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full rounded-full border border-transparent bg-muted/60 pr-4 pl-10 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    </div>
  );
}
