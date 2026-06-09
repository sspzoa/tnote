"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

interface HistoryListSkeletonProps {
  count?: number;
}

export function HistoryListSkeleton({ count = 3 }: HistoryListSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16 rounded-sm" />
              <Skeleton className="h-4 w-32 rounded-sm" />
            </div>
            <Skeleton className="h-4 w-24 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
