import type { InputHTMLAttributes } from "react";

type SearchInputSize = "sm" | "lg";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  placeholder?: string;
  size?: SearchInputSize;
}

const sizeStyles: Record<SearchInputSize, string> = {
  sm: "rounded-radius-300 px-spacing-400 py-spacing-200 text-label",
  lg: "rounded-radius-400 px-spacing-500 py-spacing-400 text-body",
};

export function SearchInput({ placeholder = "검색...", size = "sm", className = "", ...props }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`w-full border border-line-outline bg-components-fill-standard-secondary text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
