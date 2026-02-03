import { Skeleton } from "@/shared/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-spacing-600">
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
      <div className="flex flex-col gap-spacing-200">
        <div className="flex items-center gap-spacing-300">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-10 rounded-radius-200" />
        </div>
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-spacing-400">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-spacing-400 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-radius-400" />
      ))}
    </div>

    <Skeleton className="h-48 w-full rounded-radius-400" />

    <div className="grid gap-spacing-500 lg:grid-cols-2">
      <Skeleton className="h-64 w-full rounded-radius-400" />
      <Skeleton className="h-64 w-full rounded-radius-400" />
    </div>

    <Skeleton className="h-48 w-full rounded-radius-400" />
    <Skeleton className="h-48 w-full rounded-radius-400" />
    <Skeleton className="h-48 w-full rounded-radius-400" />
  </div>
);
