import { Skeleton } from "@/shared/components/ui/skeleton";

export function StudentInfoSkeleton() {
  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-20" />
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted p-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-28" />
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between bg-muted px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-sm" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between bg-muted px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12 rounded-sm" />
                <Skeleton className="h-5 w-12 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between bg-muted px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-sm" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between bg-muted px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-12 rounded-sm" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
