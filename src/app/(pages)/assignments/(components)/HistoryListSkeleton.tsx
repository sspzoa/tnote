"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

interface HistoryListSkeletonProps {
  count?: number;
}

/** Mirrors the FeedItem timeline rendered in AssignmentTaskHistoryModal once the history loads. */
export function HistoryListSkeleton({ count = 4 }: HistoryListSkeletonProps) {
  return (
    <div className="pt-0.5">
      {Array.from({ length: count }).map((_, i) => {
        const last = i === count - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              {!last && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${last ? "pb-1" : "pb-5"}`}>
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-6 w-12 rounded-md" />
                <Skeleton className="mt-0.5 h-3.5 w-28" />
              </div>
              <Skeleton className="h-7 w-40 rounded-md" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
