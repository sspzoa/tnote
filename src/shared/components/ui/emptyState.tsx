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
    <div className="py-spacing-900 text-center">
      {icon && <div className="mb-spacing-400 flex justify-center text-content-standard-tertiary">{icon}</div>}
      <p className="text-body text-content-standard-tertiary">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-spacing-500">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
