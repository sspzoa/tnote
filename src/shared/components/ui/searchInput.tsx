import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/cn";

type SearchInputSize = "md" | "lg";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  placeholder?: string;
  size?: SearchInputSize;
}

const sizeStyles: Record<SearchInputSize, string> = {
  md: "rounded-md px-4 py-3 text-base",
  lg: "rounded-lg px-5 py-4 text-base",
};

export function SearchInput({ placeholder = "검색...", size = "md", className = "", ...props }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={cn(
        "w-full border border-border bg-muted text-foreground outline-none transition-all duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
