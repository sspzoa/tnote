import { Skeleton } from "@/shared/components/ui/skeleton";

/** One SectionCard list slice — colored icon-well header + count badge + a couple of record rows. */
function ListSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-5 w-7 rounded-md" />
      </div>
      <div className="border-border border-t">
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border-border border-b px-5 py-3 last:border-b-0">
            <div className="flex min-w-0 flex-col gap-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentInfoSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header band — identity cluster + contact meta + basic-info StatStrip */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <div className="flex flex-col border-border border-t pt-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-border border-b py-2.5 last:border-b-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      <ListSectionSkeleton rows={2} />
      <ListSectionSkeleton rows={3} />
      <ListSectionSkeleton rows={2} />
      <ListSectionSkeleton rows={2} />
      <ListSectionSkeleton rows={2} />
    </div>
  );
}
