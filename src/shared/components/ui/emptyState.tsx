import type { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ message, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-spacing-400 py-spacing-900 text-center">
      {icon && (
        <div className="flex size-16 items-center justify-center rounded-full bg-core-accent-translucent text-core-accent">
          {icon}
        </div>
      )}
      <p className="text-body text-content-standard-tertiary">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
