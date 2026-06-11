import { cn } from "@/shared/lib/utils/cn";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "toggle";
}

const baseStyles =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3.5 font-medium text-sm whitespace-nowrap outline-none transition-[color,box-shadow,background-color,transform] duration-[--motion-fast] ease-[--ease-spring] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 active:scale-[0.97]";
const inactive =
  "border-border bg-card text-muted-foreground shadow-btn hover:border-border-strong hover:text-foreground";

export function FilterButton({ active, onClick, children, variant = "default" }: FilterButtonProps) {
  const activeStyles =
    variant === "toggle"
      ? "border-success/30 bg-success-soft text-success shadow-btn"
      : "border-primary bg-primary text-primary-foreground shadow-btn-primary";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(baseStyles, active ? activeStyles : inactive)}>
      {children}
    </button>
  );
}
