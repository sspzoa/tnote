import { cn } from "@/shared/lib/utils/cn";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "toggle";
}

const baseStyles =
  "inline-flex h-9 items-center rounded-full border px-3.5 font-medium text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const inactive = "border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-foreground";

export function FilterButton({ active, onClick, children, variant = "default" }: FilterButtonProps) {
  const activeStyles =
    variant === "toggle"
      ? "border-transparent bg-success/15 text-success"
      : "border-transparent bg-primary text-primary-foreground";

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
