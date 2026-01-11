import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  placeholder?: string;
}

export function SearchInput({ placeholder = "검색...", className = "", ...props }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-label transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent ${className}`}
      {...props}
    />
  );
}
