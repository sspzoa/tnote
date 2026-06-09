import type { ComponentType } from "react";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
}

export const StatCard = ({ icon: Icon, label, value, subValue }: StatCardProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-card p-5 shadow-sm print:rounded-sm print:border print:border-border print:bg-white print:p-3 print:shadow-none">
    <div className="flex items-start justify-between gap-3 print:gap-1">
      <span className="font-medium text-muted-foreground text-sm">{label}</span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary print:hidden">
        <Icon className="size-5" />
      </span>
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-2xl text-foreground tabular-nums tracking-[-0.02em] print:text-sm">{value}</span>
      {subValue && <span className="text-muted-foreground text-xs print:text-[10px] print:leading-4">{subValue}</span>}
    </div>
  </div>
);
