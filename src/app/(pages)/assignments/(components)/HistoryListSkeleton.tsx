"use client";

interface HistoryListSkeletonProps {
  count?: number;
}

export function HistoryListSkeleton({ count = 3 }: HistoryListSkeletonProps) {
  return (
    <div className="flex flex-col gap-spacing-400">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
          <div className="flex items-center justify-between gap-spacing-300">
            <div className="flex items-center gap-spacing-300">
              <div className="h-6 w-16 animate-pulse rounded-radius-200 bg-components-fill-standard-tertiary" />
              <div className="h-5 w-32 animate-pulse rounded-radius-200 bg-components-fill-standard-tertiary" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded-radius-200 bg-components-fill-standard-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}
