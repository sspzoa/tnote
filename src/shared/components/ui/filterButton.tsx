import { cn } from "@/shared/lib/utils/cn";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "toggle";
}

const baseStyles =
  "inline-flex h-8 items-center rounded-md border px-3 font-medium text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const inactive = "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground";

export function FilterButton({ active, onClick, children, variant = "default" }: FilterButtonProps) {
  const activeStyles =
    variant === "toggle"
      ? "border-success/30 bg-success/10 text-success"
      : "border-primary bg-primary text-primary-foreground";

  return (
    <button type="button" onClick={onClick} className={cn(baseStyles, active ? activeStyles : inactive)}>
      {children}
    </button>
  );
}
