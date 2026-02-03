import { Skeleton } from "@/shared/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-spacing-600">
    <div className="flex items-start gap-spacing-500 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600">
      <Skeleton className="h-16 w-16 rounded-radius-full" />
      <div className="flex-1 flex flex-col gap-spacing-200">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-spacing-200">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-spacing-400 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-radius-400" />
      ))}
    </div>

    <div className="grid gap-spacing-500 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-radius-400" />
      ))}
    </div>
  </div>
);
