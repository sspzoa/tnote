import { Skeleton } from "@/shared/components/ui/skeleton";

interface HistoryListSkeletonProps {
  count?: number;
}

export function HistoryListSkeleton({ count = 4 }: HistoryListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="h-7 w-16 shrink-0 rounded-sm" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
