import type { ComponentType } from "react";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  colorClass: string;
}

export const StatCard = ({ icon: Icon, label, value, subValue, colorClass }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500 transition-all hover:border-line-outline-strong print:rounded-radius-200 print:border-line-divider print:bg-white print:p-spacing-300">
    <div
      className={`-right-4 -top-4 absolute h-24 w-24 rounded-full opacity-10 print:hidden ${colorClass.split(" ")[0]}`}
    />

    <div className="relative flex flex-col gap-spacing-300 print:gap-spacing-100">
      <div className="flex items-center justify-between">
        <span className="text-content-standard-secondary text-label">{label}</span>
        <div className={`rounded-radius-300 p-spacing-200 print:bg-transparent print:p-spacing-100 ${colorClass}`}>
          <Icon className="h-4 w-4 print:h-3 print:w-3" />
        </div>
      </div>

      <div className="flex flex-col gap-spacing-50">
        <span className="font-bold text-content-standard-primary text-title print:text-body">{value}</span>
        {subValue && <span className="text-content-standard-tertiary text-label print:text-caption">{subValue}</span>}
      </div>
    </div>
  </div>
);
