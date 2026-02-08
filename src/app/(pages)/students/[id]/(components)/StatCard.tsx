import type { ComponentType } from "react";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
}

export const StatCard = ({ icon: Icon, label, value, subValue }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500 transition-all hover:border-line-outline-strong print:rounded-radius-200 print:border-line-divider print:bg-white print:p-spacing-300">
    <div className="flex items-start justify-between gap-spacing-300 print:gap-spacing-100">
      <div className="flex flex-col gap-spacing-50">
        <span className="font-bold text-content-standard-primary text-title print:text-body">{value}</span>
        <div>
          <div className="font-medium text-content-standard-primary text-label">{label}</div>
          {subValue && (
            <span className="text-content-standard-tertiary text-footnote print:text-caption">{subValue}</span>
          )}
        </div>
      </div>
      <Icon className="size-8 shrink-0 text-core-accent" />
    </div>
  </div>
);
