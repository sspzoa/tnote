import { Skeleton } from "@/shared/components/ui/skeleton";

interface HistoryListSkeletonProps {
  count?: number;
}

export function HistoryListSkeleton({ count = 4 }: HistoryListSkeletonProps) {
  return (
    <div className="space-y-spacing-400">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
          <div className="flex items-center justify-between gap-spacing-300">
            <div className="flex min-w-0 flex-1 items-center gap-spacing-300">
              <Skeleton className="h-7 w-16 shrink-0 rounded-radius-200" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex shrink-0 items-center gap-spacing-300">
              <div className="flex shrink-0 flex-col items-end gap-spacing-50">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-radius-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
