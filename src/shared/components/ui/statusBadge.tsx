type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-solid-translucent-green text-core-status-positive border border-core-status-positive/20",
  warning: "bg-solid-translucent-yellow text-core-status-warning border border-core-status-warning/20",
  danger: "bg-solid-translucent-red text-core-status-negative border border-core-status-negative/20",
  info: "bg-core-accent-translucent text-core-accent border border-core-accent/20",
  neutral: "bg-components-fill-standard-secondary text-content-standard-secondary border border-line-outline",
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-label ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
