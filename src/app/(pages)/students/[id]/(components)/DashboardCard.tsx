import type { ComponentType, ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  scrollable?: boolean;
  noPadding?: boolean;
}

export const DashboardCard = ({
  title,
  icon: Icon,
  children,
  emptyMessage,
  isEmpty,
  scrollable,
  noPadding,
}: DashboardCardProps) => (
  <div className="flex flex-col overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
    <div className="flex items-center gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
      <Icon className="h-4 w-4 text-content-standard-tertiary" />
      <h3 className="font-semibold text-body text-content-standard-primary">{title}</h3>
    </div>
    {isEmpty ? (
      <div className="flex flex-col items-center justify-center gap-spacing-200 py-spacing-800 text-content-standard-tertiary">
        <Icon className="h-8 w-8 opacity-30" />
        <span className="text-footnote">{emptyMessage}</span>
      </div>
    ) : (
      <div className={`${noPadding ? "" : "divide-y divide-line-divider"} ${scrollable ? "overflow-y-auto" : ""}`}>
        {children}
      </div>
    )}
  </div>
);
