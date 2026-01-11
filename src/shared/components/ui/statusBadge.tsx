type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-solid-translucent-green text-core-status-positive",
  warning: "bg-solid-translucent-yellow text-core-status-warning",
  danger: "bg-solid-translucent-red text-core-status-negative",
  info: "bg-solid-translucent-blue text-core-accent",
  neutral: "bg-components-fill-standard-secondary text-content-standard-secondary",
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-label ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
