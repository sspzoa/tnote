"use client";

interface HistoryListSkeletonProps {
  count?: number;
}

export function HistoryListSkeleton({ count = 3 }: HistoryListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 animate-pulse rounded-sm bg-muted" />
              <div className="h-5 w-32 animate-pulse rounded-sm bg-muted" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
