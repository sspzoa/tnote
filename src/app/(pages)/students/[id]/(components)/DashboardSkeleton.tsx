import { Skeleton } from "@/shared/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <>
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-[38px] w-[62px] rounded-md" />
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-[26px] w-12 rounded-sm" />
              </div>
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-[22px] w-28" />
                <Skeleton className="h-[22px] w-28" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-[26px] w-10 rounded-sm" />
              <Skeleton className="h-[26px] w-12 rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-8 w-16" />
                <div className="flex flex-col gap-0.5">
                  <Skeleton className="h-[22px] w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-sm" />
            </div>
          </div>
        ))}
      </section>
    </div>

    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-border border-b bg-muted px-5 py-4">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-md" />
        ))}
      </div>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-border border-b bg-muted px-5 py-4">
            <Skeleton className="size-4" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex flex-col divide-y divide-border">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="px-5 py-4">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-border border-b bg-muted px-5 py-4">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-md" />
        ))}
      </div>
    </div>

    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-border border-b bg-muted px-5 py-4">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex flex-col divide-y divide-border">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="px-5 py-4">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-border border-b bg-muted px-5 py-4">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col divide-y divide-border">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="px-5 py-4">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  </>
);
