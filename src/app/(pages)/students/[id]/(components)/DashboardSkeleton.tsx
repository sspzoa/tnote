import { Skeleton } from "@/shared/components/ui/skeleton";

/** Mirrors the DetailHeader profile band — passed to PageShell's `header` slot while loading. */
export const DashboardHeaderSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-start sm:justify-between">
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-12 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  </div>
);

/** A DashboardCard with a table body — colored icon-well header + a muted head strip + rows. */
const TableCardSkeleton = ({ cols, rows = 3 }: { cols: string[]; rows?: number }) => (
  <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-sm">
    <div className="flex items-center gap-2.5 px-5 py-4">
      <Skeleton className="size-8 rounded-xl" />
      <Skeleton className="h-5 w-28" />
    </div>
    <div className="flex items-center gap-4 bg-muted px-4 py-2.5">
      {cols.map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${cols[i]}`} />
      ))}
    </div>
    {[...Array(rows)].map((_, r) => (
      <div key={r} className="flex items-center gap-4 border-border border-t px-4 py-3">
        {cols.map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w}`} />
        ))}
      </div>
    ))}
  </div>
);

/** Mirrors the DetailGrid body of the student detail page (main tables + meta sidebar). */
export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div className="flex min-w-0 flex-col gap-5">
      <TableCardSkeleton cols={["w-28", "w-14", "w-12", "w-12", "w-12", "w-14"]} rows={4} />
      <TableCardSkeleton cols={["w-40", "w-24", "w-12"]} rows={3} />
      <TableCardSkeleton cols={["w-32", "w-16", "w-12", "w-16"]} rows={3} />
    </div>

    <aside className="flex flex-col gap-5">
      {/* 요약 — SectionCard with a vertical StatStrip */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex flex-col px-5 pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-border border-b py-2.5 last:border-b-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* 수강 중인 수업 — DashboardCard with course chips */}
      <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <Skeleton className="size-8 rounded-xl" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-3 p-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted px-4 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  </div>
);
