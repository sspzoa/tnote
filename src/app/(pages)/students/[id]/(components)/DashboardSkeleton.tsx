import { Skeleton } from "@/shared/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <>
    <div className="flex flex-col gap-spacing-600">
      <section className="flex flex-col gap-spacing-400">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-[38px] w-[62px] rounded-radius-300" />
        </div>

        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <div className="flex flex-col gap-spacing-300 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-spacing-200">
              <div className="flex items-center gap-spacing-300">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-[26px] w-12 rounded-radius-200" />
              </div>
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-spacing-400">
                <Skeleton className="h-[22px] w-28" />
                <Skeleton className="h-[22px] w-28" />
              </div>
            </div>
            <div className="flex gap-spacing-100">
              <Skeleton className="h-[26px] w-10 rounded-radius-200" />
              <Skeleton className="h-[26px] w-12 rounded-radius-200" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-spacing-400 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
            <div className="flex items-start justify-between gap-spacing-300">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-8 w-16" />
                <div className="flex flex-col gap-spacing-50">
                  <Skeleton className="h-[22px] w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-radius-200" />
            </div>
          </div>
        ))}
      </section>
    </div>

    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <div className="flex items-center gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="grid gap-spacing-300 p-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-radius-300" />
        ))}
      </div>
    </div>

    <div className="grid gap-spacing-500 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
          <div className="flex items-center gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
            <Skeleton className="size-4" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex flex-col divide-y divide-line-divider">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="px-spacing-500 py-spacing-400">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <div className="flex items-center gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid gap-spacing-300 p-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-radius-300" />
        ))}
      </div>
    </div>

    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <div className="flex items-center gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex flex-col divide-y divide-line-divider">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="px-spacing-500 py-spacing-400">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <div className="flex items-center gap-spacing-200 border-line-divider border-b bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col divide-y divide-line-divider">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="px-spacing-500 py-spacing-400">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  </>
);
