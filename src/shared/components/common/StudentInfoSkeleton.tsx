import { Skeleton } from "@/shared/components/ui/skeleton";

export function StudentInfoSkeleton() {
  return (
    <div className="flex flex-col gap-spacing-600">
      <section className="flex flex-col gap-spacing-300">
        <Skeleton className="h-6 w-20" />
        <div className="grid grid-cols-2 gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-spacing-50">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-spacing-300">
        <Skeleton className="h-6 w-28" />
        <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-radius-200" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-spacing-300">
        <Skeleton className="h-6 w-28" />
        <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center gap-spacing-200">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16 rounded-radius-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-spacing-300">
        <Skeleton className="h-6 w-28" />
        <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
              <div className="flex flex-col gap-spacing-50">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-spacing-200">
                <Skeleton className="h-6 w-14 rounded-radius-200" />
                <Skeleton className="h-6 w-12 rounded-radius-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
