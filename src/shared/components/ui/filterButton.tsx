import { cn } from "@/shared/lib/utils/cn";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "toggle";
}

export function FilterButton({ active, onClick, children, variant = "default" }: FilterButtonProps) {
  const baseStyles = "rounded-md px-4 py-2 font-medium text-sm transition-all duration-150 border";

  if (variant === "toggle") {
    return (
      <button
        onClick={onClick}
        className={cn(
          baseStyles,
          active
            ? "border-success/30 bg-success/10 text-success"
            : "border-border bg-muted text-muted-foreground hover:border-primary/30 hover:bg-accent",
        )}>
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        baseStyles,
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-muted-foreground hover:border-primary/30 hover:bg-accent",
      )}>
      {children}
    </button>
  );
}
