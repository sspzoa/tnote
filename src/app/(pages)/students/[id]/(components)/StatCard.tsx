import type { ComponentType } from "react";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
}

export const StatCard = ({ icon: Icon, label, value, subValue }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-border print:rounded-sm print:border-border print:bg-white print:p-3">
    <div className="flex items-start justify-between gap-3 print:gap-1">
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-foreground text-2xl print:text-base">{value}</span>
        <div>
          <div className="font-medium text-foreground text-sm">{label}</div>
          {subValue && (
            <span className="text-muted-foreground text-xs print:text-[10px] print:leading-4">{subValue}</span>
          )}
        </div>
      </div>
      <Icon className="size-8 shrink-0 text-primary" />
    </div>
  </div>
);
