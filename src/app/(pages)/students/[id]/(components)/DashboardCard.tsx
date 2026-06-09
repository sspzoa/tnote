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
  <div className="flex flex-col overflow-hidden rounded-2xl border border-transparent bg-card shadow-sm print:overflow-visible print:rounded-none print:border print:bg-white print:shadow-none">
    <div className="flex items-center gap-2.5 px-5 py-4 print:px-0 print:py-2">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary print:hidden">
        <Icon className="size-4" />
      </span>
      <h3 className="font-semibold text-base text-foreground tracking-[-0.01em]">{title}</h3>
    </div>
    {isEmpty ? (
      <div className="flex flex-col items-center justify-center gap-2 px-5 pb-8 text-muted-foreground print:py-3">
        <Icon className="h-8 w-8 opacity-30 print:hidden" />
        <span className="text-sm">{emptyMessage}</span>
      </div>
    ) : (
      <div
        className={`${noPadding ? "" : "divide-y divide-border"} ${scrollable ? "overflow-y-auto print:overflow-visible" : ""}`}>
        {children}
      </div>
    )}
  </div>
);
