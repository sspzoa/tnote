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
  <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card print:overflow-visible print:rounded-none print:border-0 print:bg-white">
    <div className="flex items-center gap-2 border-border border-b bg-muted px-5 py-4 print:bg-transparent print:px-0 print:py-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="font-semibold text-base text-foreground">{title}</h3>
    </div>
    {isEmpty ? (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground print:py-3">
        <Icon className="h-8 w-8 opacity-30 print:hidden" />
        <span className="text-xs">{emptyMessage}</span>
      </div>
    ) : (
      <div
        className={`${noPadding ? "" : "divide-y divide-border"} ${scrollable ? "overflow-y-auto print:overflow-visible" : ""}`}>
        {children}
      </div>
    )}
  </div>
);
